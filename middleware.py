import logging
import bleach
from functools import wraps
from flask import request, jsonify
from config import Config

logger = logging.getLogger('FallingDownAI.Middleware')

VALID_MOVEMENT_STATUSES = {
    'normal', 'slight', 'moderate_fall', 
    'fall_detected', 'audio_only', 'none'
}

def require_api_key(f):
    """Protect sensitive write endpoints (e.g. pose_detector.py needs this auth)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not Config.API_KEY:
            return f(*args, **kwargs)  # Bypass if key is not configured in .env
            
        provided_key = (
            request.headers.get('X-API-Key') or 
            request.args.get('api_key')
        )
        
        if provided_key != Config.API_KEY:
            logger.warning(f"Unauthorized API request blocked from remote IP: {request.remote_addr}")
            return jsonify({"error": "Unauthorized Access"}), 401
            
        return f(*args, **kwargs)
    return decorated

def validate_incident_data(data):
    """Sanitize and validate incoming incident updates."""
    if not data:
        return None, "Request body required"
        
    movement = data.get('movement', 'normal')
    if movement not in VALID_MOVEMENT_STATUSES:
        return None, f"Invalid movement status: '{movement}'"
        
    location = bleach.clean(
        str(data.get('location', 'Camera 01'))[:100]
    )
    
    image_filename = data.get('image_filename')
    if image_filename:
        # Prevent path traversal
        import os
        image_filename = os.path.basename(str(image_filename))
        
    return {
        'movement': movement,
        'fall': bool(data.get('fall', False)),
        'critical': bool(data.get('critical', False)),
        'location': location,
        'image_filename': image_filename
    }, None

def validate_lead_data(data):
    """Sanitize and validate incoming lead captures."""
    if not data:
        return None, "Request body required"
        
    required = ['name', 'phone']
    for field in required:
        if not data.get(field):
            return None, f"Field '{field}' is required"
            
    return {
        'name': bleach.clean(str(data.get('name', ''))[:100]),
        'phone': bleach.clean(str(data.get('phone', ''))[:20]),
        'email': bleach.clean(str(data.get('email', ''))[:200]),
        'role': bleach.clean(str(data.get('role', ''))[:100]),
        'facility': bleach.clean(str(data.get('facility', ''))[:200]),
        'message': bleach.clean(str(data.get('message', ''))[:1000])
    }, None
