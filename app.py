import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from datetime import datetime
from twilio.rest import Client
import google.generativeai as genai

# =========================
# LOAD ENV
# =========================
load_dotenv()

app = Flask(__name__)
CORS(app)

# =========================
# TWILIO CONFIG
# =========================
TWILIO_SID = os.getenv(
    "TWILIO_ACCOUNT_SID"
)

TWILIO_TOKEN = os.getenv(
    "TWILIO_AUTH_TOKEN"
)

TWILIO_PHONE = os.getenv(
    "TWILIO_WHATSAPP_NUMBER"
)

PUBLIC_URL = os.getenv(
    "PUBLIC_URL"
)

CAREGIVERS = [

    os.getenv(
        "CAREGIVER_WHATSAPP_NUMBER"
    ),

    os.getenv(
        "CAREGIVER2_WHATSAPP_NUMBER"
    ),

    os.getenv(
        "CAREGIVER3_WHATSAPP_NUMBER"
    )

]

twilio_client = Client(
    TWILIO_SID,
    TWILIO_TOKEN
) if TWILIO_SID else None

# =========================
# GEMINI CONFIG
# =========================
GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

if GEMINI_API_KEY:
    genai.configure(
        api_key=GEMINI_API_KEY
    )

CHAT_SYSTEM_PROMPT = (
    "You are the FallingDown AI Care Assistant. "
    "Role: Help visitors understand the platform. "
    "Tone: Professional, empathetic, assuring. "
    "Constraints: Keep answers to 2 short paragraphs max."
)

# =========================
# UPLOAD CONFIG
# =========================
UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config[
    "UPLOAD_FOLDER"
] = UPLOAD_FOLDER

incident_logs = []
leads_db = []

# =========================
# WHATSAPP ALERT
# =========================
def send_whatsapp_alert(
    incident_data
):

    if not twilio_client:
        return False

    try:

        location = incident_data.get(
            "location",
            "Camera 01"
        )

        movement = incident_data.get(
            "movement_status",
            "normal"
        )

        if movement == "audio_only":

            status = "AUDIO DISTRESS"

            evidence = (
                "⚠️ NO VIDEO "
                "(Privacy Zone).\n"
                "Distress voice detected."
            )

        elif movement in ["none", "fall_detected"]:

            status = "CRITICAL FALL"

            evidence = (
                "Subject motionless. Review evidence."
            )

        elif movement in ["slight", "moderate_fall"]:

            status = "MODERATE FALL"

            evidence = (
                "Movement detected."
            )

        else:

            status = "NORMAL FALL"

            evidence = (
                "Safety check advised."
            )

        alert_msg = (

            f"🚨 FALLINGDOWN AI 🚨\n\n"
            f"Status: {status}\n"
            f"Time: {incident_data['timestamp']}\n"
            f"Location: {location}\n\n"
            f"{evidence}"

        )

        media_url = []

        if incident_data.get("image_filename") and PUBLIC_URL:
            
            full_image_url = (
                f"{PUBLIC_URL}/uploads/"
                f"{incident_data['image_filename']}"
            )
            media_url.append(full_image_url)

        for caregiver in CAREGIVERS:

            if caregiver:

                message = twilio_client.messages.create(

                    from_=TWILIO_PHONE,
                    body=alert_msg,
                    to=caregiver,
                    media_url=media_url if media_url else None

                )

                print(
                    "✅ Sent:",
                    caregiver,
                    message.sid
                )

        return True

    except Exception as e:

        print(
            "❌ WhatsApp failed:",
            str(e)
        )

        return False

# =========================
# STATUS
# =========================
@app.route(
    '/api/status'
)
def status():

    return jsonify({

        "status":
        "Active"

    })

# =========================
# INCIDENT
# =========================
@app.route(
    '/api/incident',
    methods=['POST']
)
def incident():

    data = request.json

    new_incident = {

        "id":
        len(
            incident_logs
        ) + 1,

        "timestamp":
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "fall_detected":
        data.get(
            "fall",
            False
        ),

        "movement_status":
        data.get(
            "movement",
            "normal"
        ),

        "is_critical":
        data.get(
            "critical",
            False
        ),

        "image_filename":
        data.get(
            "image_filename",
            None
        ),

        "location":
        data.get(
            "location",
            "Camera 01"
        )
    }

    incident_logs.append(
        new_incident
    )

    print(
        "[ALERT]",
        new_incident
    )

    if new_incident["is_critical"] or new_incident["movement_status"] == "fall_detected":

        send_whatsapp_alert(
            new_incident
        )

    return jsonify({

        "status":
        "logged",

        "incident":
        new_incident

    }),201

# =========================
# PHOTO UPLOAD & SERVE
# =========================
@app.route(
    '/uploads/<filename>'
)
def serve_uploaded_file(filename):

    return send_from_directory(
        app.config['UPLOAD_FOLDER'], 
        filename
    )

@app.route(
    '/api/upload',
    methods=['POST']
)
def upload():

    if 'file' not in request.files:

        return jsonify({
            "error":
            "No file"
        }),400

    file = request.files[
        'file'
    ]

    filename = secure_filename(
        file.filename
    )

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    file.save(
        filepath
    )

    print(
        "📸 Saved:",
        filepath
    )

    return jsonify({

        "status":
        "success",

        "filename": 
        filename,

        "path":
        filepath

    })

# =========================
# LOGS & LEADS
# =========================
@app.route(
    '/api/logs'
)
def logs():

    return jsonify({

        "logs":
        incident_logs

    })

@app.route(
    '/api/leads', 
    methods=['GET', 'POST']
)
def handle_leads():

    if request.method == 'POST':

        data = request.json

        leads_db.append(
            data
        )

        print(
            "📥 New Lead Saved:",
            data.get('name')
        )

        return jsonify({
            "status": "success"
        }), 201
    
    return jsonify({
        "leads": leads_db
    }), 200

# =========================
# GEMINI CHAT
# =========================
@app.route(
    '/api/chat', 
    methods=['POST']
)
def chat():

    data = request.json

    user_message = data.get(
        "message", 
        ""
    )

    history = data.get(
        "history", 
        ""
    )

    if not GEMINI_API_KEY:
        print("⚠️ Warning: GEMINI_API_KEY is not set. Using mock responses for demo.")
        msg_lower = user_message.lower()
        if "help" in msg_lower or "support" in msg_lower:
            reply = (
                "I'm here to help! You can ask me about how our fall detection works, "
                "how the privacy zones are managed, or how to configure Twilio notifications for caregivers."
            )
        elif "fall" in msg_lower or "detect" in msg_lower or "accuracy" in msg_lower:
            reply = (
                "FallingDown AI uses advanced pose estimation to track skeletal coordinates in real-time. "
                "If it detects rapid downward acceleration or a subject remaining motionless on the floor, "
                "it triggers an alert and sends a notification immediately."
            )
        elif "privacy" in msg_lower or "bathroom" in msg_lower or "camera" in msg_lower:
            reply = (
                "We value privacy. In sensitive areas like bathrooms, you can toggle 'Privacy Zone'. "
                "This disables video processing entirely and uses acoustic monitoring to detect voice distress or impact sounds."
            )
        elif "pricing" in msg_lower or "cost" in msg_lower or "subscribe" in msg_lower:
            reply = (
                "We offer two main pricing tiers:\n"
                "- **Home Care** at $49/month for individual smart camera monitoring.\n"
                "- **Care Facilities** with custom pricing integrating directly into your existing CCTV network."
            )
        else:
            reply = (
                "That's a great question! FallingDown AI is a state-of-the-art elder care monitoring platform. "
                "It uses edge AI to detect falls and distress sounds without requiring users to wear any tracking devices.\n\n"
                "Let me know if you want to learn more about our setup, features, or integrations!"
            )
        return jsonify({
            "response": reply
        }), 200
    prompt = (
        f"System Rules: {CHAT_SYSTEM_PROMPT}\n\n"
        f"Chat History:\n{history}\n\n"
        f"User: {user_message}\nAssistant:"
    )

    print(
        "🤖 Gemini AI is processing..."
    )

    try:

        model = genai.GenerativeModel(
            'gemini-1.5-flash'
        )

        response = model.generate_content(
            prompt
        )

        print(
            "✅ Gemini AI replied!"
        )

        return jsonify({
            "response": response.text
        }), 200

    except Exception as e:

        print(
            "Gemini Error:", 
            e
        )

        return jsonify({
            "error": "AI Failed"
        }), 500

# =========================
# DELETE INCIDENT / IMAGE
# =========================
@app.route(
    '/api/incident/<int:incident_id>', 
    methods=['DELETE']
)
def delete_incident(incident_id):
    global incident_logs
    original_len = len(incident_logs)
    incident_logs = [log for log in incident_logs if log.get('id') != incident_id]
    if len(incident_logs) < original_len:
        print(f"🗑️ Deleted incident ID: {incident_id}")
        return jsonify({"status": "success", "message": "Incident deleted"}), 200
    return jsonify({"error": "Incident not found"}), 404

@app.route(
    '/api/incident/<int:incident_id>/image', 
    methods=['DELETE']
)
def delete_incident_image(incident_id):
    global incident_logs
    for log in incident_logs:
        if log.get('id') == incident_id:
            img_file = log.get('image_filename')
            if img_file:
                file_path = os.path.join(UPLOAD_FOLDER, img_file)
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        print(f"🗑️ Deleted file from disk: {file_path}")
                    except Exception as e:
                        print(f"⚠️ Error deleting file: {e}")
            log['image_filename'] = None
            print(f"🗑️ Removed image from incident ID: {incident_id}")
            return jsonify({"status": "success", "message": "Image deleted from incident"}), 200
    return jsonify({"error": "Incident not found"}), 404

# =========================
# RUN
# =========================
if __name__ == '__main__':

    print(
        "🚀 FallingDown AI Backend"
    )

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )