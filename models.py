import logging
from pymongo import MongoClient, DESCENDING
from config import Config

logger = logging.getLogger('FallingDownAI.Models')

class Database:
    _client = None
    _db = None
    _is_connected = False
    
    @classmethod
    def connect(cls):
        try:
            logger.info("Connecting to MongoDB...")
            cls._client = MongoClient(
                Config.MONGO_URI,
                serverSelectionTimeoutMS=3000
            )
            # Ping database to test selection
            cls._client.admin.command('ping')
            cls._db = cls._client['fallingdown']
            
            # Setup indexes
            cls._db.incidents.create_index([('timestamp', DESCENDING)])
            cls._db.incidents.create_index([('is_critical', 1)])
            cls._db.incidents.create_index([('movement_status', 1)])
            cls._db.leads.create_index([('phone', 1)], unique=True)
            cls._db.leads.create_index([('created_at', DESCENDING)])
            
            cls._is_connected = True
            logger.info("✅ Successfully connected to MongoDB and verified indexes.")
            return True
        except Exception as e:
            cls._is_connected = False
            cls._client = None
            cls._db = None
            logger.warning(f"⚠️ MongoDB connection failed: {e}. Falling back to transient in-memory logs.")
            return False
            
    @classmethod
    def get_db(cls):
        return cls._db

    @classmethod
    def is_connected(cls):
        return cls._is_connected
