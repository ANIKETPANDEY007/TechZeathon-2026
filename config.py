import os

class Config:
    # Server configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('FLASK_ENV', 'production') == 'development'
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-unsecure-secret-key-change-it')
    
    # CORS
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:5500,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4000,http://127.0.0.1:4000').split(',')
    
    # MongoDB Connection URL
    MONGO_URI = os.getenv('MONGO_URI') or os.getenv('MONGODB_URI') or 'mongodb://localhost:27017/fallingdown'
    
    # Twilio Alerts Configuration
    TWILIO_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE = os.getenv('TWILIO_WHATSAPP_NUMBER')
    PUBLIC_URL = os.getenv('PUBLIC_URL')
    
    CAREGIVERS = [
        os.getenv(f'CAREGIVER{i}_WHATSAPP_NUMBER') 
        for i in ['', '2', '3', '4', '5']
        if os.getenv(f'CAREGIVER{i}_WHATSAPP_NUMBER')
    ]
    
    # Google Gemini AI Models Config
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL = 'gemini-2.0-flash'
    GEMINI_MAX_TOKENS = 500
    CHAT_MAX_MESSAGE_LENGTH = 1000
    
    # Image/File Upload Configurations
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_UPLOAD_SIZE_MB = 5
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
    
    # API key constraint
    API_KEY = os.getenv('API_KEY')
    
    # Rate limits configuration
    RATE_LIMIT_INCIDENT = '30 per minute'
    RATE_LIMIT_CHAT = '10 per minute'
    RATE_LIMIT_DEFAULT = '100 per minute'
    
    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
