import os
import uuid
import time
import logging
import threading
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from twilio.rest import Client
import google.generativeai as genai

# Load environment configs
load_dotenv()

# Structured logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('fallingdown.log', encoding='utf-8')
    ]
)
logger = logging.getLogger('FallingDownAI.Server')

# Import project configurations and database models
from config import Config
from models import Database
from middleware import require_api_key, validate_incident_data, validate_lead_data

START_TIME = time.time()

# Configure Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_UPLOAD_SIZE_MB * 1024 * 1024

# Setup CORS with explicit production/local constraints
CORS(app, 
     origins=Config.ALLOWED_ORIGINS,
     methods=['GET', 'POST', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'X-API-Key', 'Authorization'])

# Initialize rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[Config.RATE_LIMIT_DEFAULT],
    storage_uri='memory://'
)

# Connect to MongoDB with in-memory fallbacks
db_connected = Database.connect()
incident_logs_fallback = []
leads_fallback = []

# Twilio Client Configuration
twilio_client = None
if Config.TWILIO_SID and Config.TWILIO_TOKEN:
    try:
        twilio_client = Client(Config.TWILIO_SID, Config.TWILIO_TOKEN)
    except Exception as e:
        logger.error(f"Failed to initialize Twilio client: {e}")

# Gemini AI Client Configuration
if Config.GEMINI_API_KEY:
    try:
        genai.configure(api_key=Config.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure Gemini API: {e}")

# =========================
# ASYNC TWILIO ALERTS
# =========================
def send_whatsapp_alert(incident_data):
    if not twilio_client or not Config.TWILIO_PHONE:
        logger.warning("Twilio client or phone number is missing. WhatsApp alert skipped.")
        return False

    try:
        location = incident_data.get("location", "Camera 01")
        movement = incident_data.get("movement_status", "normal")
        timestamp = incident_data.get("timestamp_local", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
        if movement == "audio_only":
            status = "AUDIO DISTRESS"
            evidence = "⚠️ NO VIDEO (Privacy Zone).\nDistress voice detected."
        elif movement in ["none", "fall_detected"]:
            status = "CRITICAL FALL"
            evidence = "Subject motionless. Review evidence."
        elif movement in ["slight", "moderate_fall"]:
            status = "MODERATE FALL"
            evidence = "Movement detected."
        else:
            status = "NORMAL FALL"
            evidence = "Safety check advised."

        alert_msg = (
            f"🚨 FALLINGDOWN AI ALERT 🚨\n\n"
            f"Status: {status}\n"
            f"Time: {timestamp}\n"
            f"Location: {location}\n\n"
            f"{evidence}"
        )

        media_url = []
        if incident_data.get("image_filename") and Config.PUBLIC_URL:
            full_image_url = f"{Config.PUBLIC_URL}/uploads/{incident_data['image_filename']}"
            media_url.append(full_image_url)

        for caregiver in Config.CAREGIVERS:
            if caregiver:
                try:
                    message = twilio_client.messages.create(
                        from_=Config.TWILIO_PHONE,
                        body=alert_msg,
                        to=caregiver,
                        media_url=media_url if media_url else None
                    )
                    logger.info(f"✅ Alert dispatched to caregiver '{caregiver}' (SID: {message.sid})")
                except Exception as ex:
                    logger.error(f"❌ Failed to dispatch alert to caregiver '{caregiver}': {ex}")
        return True
    except Exception as e:
        logger.error(f"❌ WhatsApp system failure: {e}")
        return False

# =========================
# SYSTEM SECURITY HEADERS
# =========================
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    return response

# =========================
# API ENDPOINTS
# =========================

@app.route('/api/v1/status')
@app.route('/api/status')
def status():
    db_status = "connected" if db_connected else "in-memory fallback"
    return jsonify({
        "status": "Active",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": int(time.time() - START_TIME)
    })

@app.route('/api/v1/incident', methods=['POST'])
@app.route('/api/incident', methods=['POST'])
@require_api_key
@limiter.limit(Config.RATE_LIMIT_INCIDENT)
def incident():
    raw_data = request.json
    data, error = validate_incident_data(raw_data)
    if error:
        logger.warning(f"Validation failure for /api/v1/incident: {error}")
        return jsonify({"error": error}), 400

    incident_doc = {
        "id": int(time.time()),  # Keep integer compatibility with logs display UI
        "incident_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "timestamp_local": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "fall_detected": data['fall'],
        "movement_status": data['movement'],
        "is_critical": data['critical'],
        "image_filename": data['image_filename'],
        "location": data['location'],
        "source_ip": request.remote_addr
    }

    if db_connected and Database.get_db() is not None:
        try:
            Database.get_db().incidents.insert_one(incident_doc.copy())
        except Exception as e:
            logger.error(f"MongoDB write failed: {e}. Writing to fallback cache.")
            incident_logs_fallback.append(incident_doc)
    else:
        incident_logs_fallback.append(incident_doc)

    logger.info(f"🚨 Incident logged: {data['movement']} at {data['location']}")

    # Async Twilio notification
    if incident_doc["is_critical"] or data['movement'] == "fall_detected":
        thread = threading.Thread(
            target=send_whatsapp_alert,
            args=(incident_doc,),
            daemon=True
        )
        thread.start()

    return jsonify({
        "status": "logged",
        "incident": incident_doc
    }), 201

@app.route('/api/v1/logs')
@app.route('/api/logs')
def logs():
    page = max(1, int(request.args.get('page', 1)))
    limit = min(
        int(request.args.get('limit', Config.DEFAULT_PAGE_SIZE)),
        Config.MAX_PAGE_SIZE
    )
    skip = (page - 1) * limit

    if db_connected and Database.get_db() is not None:
        try:
            db = Database.get_db()
            total = db.incidents.count_documents({})
            cursor = db.incidents.find({}, {'_id': 0}).sort('timestamp', -1).skip(skip).limit(limit)
            logs_list = list(cursor)
        except Exception as e:
            logger.error(f"MongoDB count/query failed: {e}")
            logs_list = list(reversed(incident_logs_fallback))[skip:skip+limit]
            total = len(incident_logs_fallback)
    else:
        logs_list = list(reversed(incident_logs_fallback))[skip:skip+limit]
        total = len(incident_logs_fallback)

    return jsonify({
        "logs": logs_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    })

@app.route('/api/v1/leads', methods=['GET', 'POST'])
@app.route('/api/leads', methods=['GET', 'POST'])
def handle_leads():
    if request.method == 'POST':
        raw_data = request.json
        data, error = validate_lead_data(raw_data)
        if error:
            logger.warning(f"Validation failure for leads POST: {error}")
            return jsonify({"error": error}), 400

        data['created_at'] = datetime.now(timezone.utc).isoformat()

        if db_connected and Database.get_db() is not None:
            try:
                db = Database.get_db()
                existing = db.leads.find_one({"phone": data['phone']})
                if existing:
                    return jsonify({
                        "status": "exists",
                        "message": "This phone number is already registered."
                    }), 200
                db.leads.insert_one(data.copy())
            except Exception as e:
                logger.error(f"MongoDB leads write failed: {e}. Writing to fallback cache.")
                leads_fallback.append(data)
        else:
            leads_fallback.append(data)

        logger.info(f"📥 New lead captured: {data.get('name')} ({data.get('role')})")
        return jsonify({"status": "success"}), 201

    else:
        # GET leads is now a protected operation
        # Apply require_api_key manually because route handles both GET and POST
        provided_key = (
            request.headers.get('X-API-Key') or 
            request.args.get('api_key')
        )
        if Config.API_KEY and provided_key != Config.API_KEY:
            logger.warning(f"Unauthorized GET /api/leads access attempt blocked from IP {request.remote_addr}")
            return jsonify({"error": "Unauthorized"}), 401

        if db_connected and Database.get_db() is not None:
            try:
                leads_list = list(Database.get_db().leads.find({}, {'_id': 0}).sort('created_at', -1))
            except Exception as e:
                logger.error(f"MongoDB leads query failed: {e}")
                leads_list = list(reversed(leads_fallback))
        else:
            leads_list = list(reversed(leads_fallback))

        return jsonify({
            "leads": leads_list,
            "total": len(leads_list)
        }), 200

@app.route('/api/v1/chat', methods=['POST'])
@app.route('/api/chat', methods=['POST'])
@limiter.limit(Config.RATE_LIMIT_CHAT)
def chat():
    if not Config.GEMINI_API_KEY:
        logger.warning("Gemini API key is missing. Yielding fallback prompt mock responses.")
        return jsonify({"error": "Gemini key not configured"}), 503

    raw_data = request.json
    if not raw_data:
        return jsonify({"error": "Invalid request body"}), 400

    user_message = str(raw_data.get("message", "")).strip()
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    if len(user_message) > Config.CHAT_MAX_MESSAGE_LENGTH:
        return jsonify({
            "error": f"Message too long. Max {Config.CHAT_MAX_MESSAGE_LENGTH} characters."
        }), 400

    history = str(raw_data.get("history", ""))[:3000]

    CHAT_SYSTEM_PROMPT = (
        "You are the FallingDown AI Care Assistant. "
        "Role: Help visitors understand the platform. "
        "Tone: Professional, empathetic, reassuring. "
        "Constraints: Keep answers to 2 short paragraphs max."
    )

    prompt = (
        f"{CHAT_SYSTEM_PROMPT}\n\n"
        f"Chat History:\n{history}\n\n"
        f"User: {user_message}\nAssistant:"
    )

    try:
        model = genai.GenerativeModel(Config.GEMINI_MODEL)
        result = [None]
        error = [None]

        def generate():
            try:
                resp = model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=Config.GEMINI_MAX_TOKENS,
                        temperature=0.7
                    )
                )
                result[0] = resp.text
            except Exception as ex:
                error[0] = str(ex)

        # Threaded call with timeout limit of 15 seconds
        t = threading.Thread(target=generate)
        t.start()
        t.join(timeout=15)

        if t.is_alive():
            logger.warning("Gemini generation timed out (limit: 15s)")
            return jsonify({"error": "AI response timed out"}), 504

        if error[0]:
            raise Exception(error[0])

        return jsonify({"response": result[0]}), 200

    except Exception as e:
        logger.error(f"Gemini execution exception: {e}")
        return jsonify({"error": "AI service temporarily unavailable"}), 500

@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    # Prevent path traversal attacks
    filename = os.path.basename(filename)
    return send_from_directory(
        Config.UPLOAD_FOLDER, 
        filename
    )

@app.route('/api/v1/upload', methods=['POST'])
@app.route('/api/upload', methods=['POST'])
@require_api_key
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    # Validate file extension
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if ext not in Config.ALLOWED_EXTENSIONS:
        logger.warning(f"Blocked invalid file upload extension '{ext}' from IP {request.remote_addr}")
        return jsonify({"error": f"Invalid extension. Allowed: {', '.join(Config.ALLOWED_EXTENSIONS)}"}), 400

    # Ensure unique safe filename
    safe_filename = f"incident_{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(Config.UPLOAD_FOLDER, safe_filename)

    file.save(filepath)
    logger.info(f"📸 Image uploaded successfully: {safe_filename}")

    return jsonify({
        "status": "success",
        "filename": safe_filename,
        "path": filepath
    })

@app.route('/api/v1/analytics')
@app.route('/api/analytics')
def analytics():
    if db_connected and Database.get_db() is not None:
        try:
            db = Database.get_db()
            pipeline = [
                {"$group": {
                    "_id": "$movement_status",
                    "count": {"$sum": 1}
                }}
            ]
            severity_data = list(db.incidents.aggregate(pipeline))
            total = db.incidents.count_documents({})
            last = db.incidents.find_one(
                {}, {'_id': 0}, 
                sort=[('timestamp', -1)]
            )
            counts = {s['_id']: s['count'] for s in severity_data}
        except Exception as e:
            logger.error(f"MongoDB analytics aggregation failed: {e}")
            counts = {}
            total = 0
            last = None
    else:
        # Fallback counts from in-memory list
        total = len(incident_logs_fallback)
        counts = {}
        for log in incident_logs_fallback:
            status = log.get('movement_status', 'normal')
            counts[status] = counts.get(status, 0) + 1
        last = incident_logs_fallback[-1] if incident_logs_fallback else None
    
    return jsonify({
        "total": total,
        "severity": {
            "critical": counts.get('fall_detected', 0),
            "moderate": counts.get('moderate_fall', 0),
            "audio": counts.get('audio_only', 0),
            "normal": counts.get('normal', 0) + counts.get('none', 0)
        },
        "last_incident": last
    })

@app.route('/api/v1/incident/<int:incident_id>', methods=['DELETE'])
@app.route('/api/incident/<int:incident_id>', methods=['DELETE'])
@require_api_key
def delete_incident(incident_id):
    deleted_count = 0
    if db_connected and Database.get_db() is not None:
        try:
            result = Database.get_db().incidents.delete_one({"id": incident_id})
            deleted_count = result.deleted_count
        except Exception as e:
            logger.error(f"MongoDB delete log failed: {e}")
    
    # Check fallback list too
    global incident_logs_fallback
    original_len = len(incident_logs_fallback)
    incident_logs_fallback = [log for log in incident_logs_fallback if log.get('id') != incident_id]
    if len(incident_logs_fallback) < original_len:
        deleted_count += 1

    if deleted_count > 0:
        logger.info(f"🗑️ Deleted incident log ID: {incident_id}")
        return jsonify({"status": "success", "message": "Incident deleted"}), 200

    return jsonify({"error": "Incident not found"}), 404

@app.route('/api/v1/incident/<int:incident_id>/image', methods=['DELETE'])
@app.route('/api/incident/<int:incident_id>/image', methods=['DELETE'])
@require_api_key
def delete_incident_image(incident_id):
    cleared_image = False
    
    # Update in MongoDB
    if db_connected and Database.get_db() is not None:
        try:
            db = Database.get_db()
            incident = db.incidents.find_one({"id": incident_id})
            if incident:
                img_file = incident.get('image_filename')
                if img_file:
                    file_path = os.path.join(Config.UPLOAD_FOLDER, img_file)
                    if os.path.exists(file_path):
                        try:
                            os.remove(file_path)
                            logger.info(f"Deleted file from disk: {file_path}")
                        except Exception as e:
                            logger.error(f"Error deleting file: {e}")
                db.incidents.update_one({"id": incident_id}, {"$set": {"image_filename": None}})
                cleared_image = True
        except Exception as e:
            logger.error(f"MongoDB incident update failed: {e}")

    # Update in fallback list
    for log in incident_logs_fallback:
        if log.get('id') == incident_id:
            img_file = log.get('image_filename')
            if img_file:
                file_path = os.path.join(Config.UPLOAD_FOLDER, img_file)
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        logger.info(f"Deleted fallback file from disk: {file_path}")
                    except Exception as e:
                        logger.error(f"Error deleting file: {e}")
            log['image_filename'] = None
            cleared_image = True

    if cleared_image:
        logger.info(f"🗑️ Cleared image reference for incident ID: {incident_id}")
        return jsonify({"status": "success", "message": "Image deleted from incident"}), 200

    return jsonify({"error": "Incident not found"}), 404

# =========================
# GLOBAL ERROR HANDLERS
# =========================
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad request", "message": str(e)}), 400

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": f"File too large. Max allowed size: {Config.MAX_UPLOAD_SIZE_MB}MB"}), 413

@app.errorhandler(429)
def rate_limited(e):
    return jsonify({
        "error": "Too many requests",
        "message": "Please slow down. Rate limit exceeded."
    }), 429

@app.errorhandler(500)
def server_error(e):
    logger.critical(f"Unhandled server error encountered: {e}")
    return jsonify({"error": "Internal server error"}), 500

# Run Config
if __name__ == '__main__':
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    logger.info(f"🚀 Product-grade Flask Server starting on port {Config.PORT}")
    logger.info(f"Mode: {'Development' if Config.DEBUG else 'Production'}")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )