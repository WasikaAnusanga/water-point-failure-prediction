import os
import socket
import logging
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

logger = logging.getLogger("waterpoint_api.db")

# Load environment variables from app/backend/.env or current working directory
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# Safe DNS fallback: Only intercept .mongodb.net hosts to prevent recursion or interference with uvicorn
try:
    import dns.resolver
    custom_resolver = dns.resolver.Resolver(configure=False)
    custom_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    custom_resolver.timeout = 5.0
    custom_resolver.lifetime = 5.0
    dns.resolver.default_resolver = custom_resolver

    if not hasattr(socket, "_waterpoint_orig_getaddrinfo"):
        socket._waterpoint_orig_getaddrinfo = socket.getaddrinfo

        def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
            # Only intercept mongodb.net lookups
            if isinstance(host, str) and ".mongodb.net" in host:
                try:
                    return socket._waterpoint_orig_getaddrinfo(host, port, family, type, proto, flags)
                except socket.gaierror:
                    try:
                        answers = custom_resolver.resolve(host, 'A')
                        ip = str(answers[0])
                        return socket._waterpoint_orig_getaddrinfo(ip, port, family, type, proto, flags)
                    except Exception:
                        raise
            return socket._waterpoint_orig_getaddrinfo(host, port, family, type, proto, flags)

        socket.getaddrinfo = patched_getaddrinfo
except Exception as e:
    logger.debug(f"Custom DNS resolver setup skipped: {e}")


MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("MONGODB_DB_NAME", "waterpoint_db")

_client: MongoClient = None
_db: Database = None


def get_database() -> Database:
    """
    Connect to MongoDB Atlas using MONGODB_URI and return the database instance.
    Cached for subsequent calls.
    """
    global _client, _db
    if _db is not None:
        return _db

    if not MONGODB_URI:
        raise ValueError(
            "MONGODB_URI environment variable is missing. "
            "Please ensure MONGODB_URI is specified in app/backend/.env"
        )

    logger.info("Initializing connection to MongoDB Atlas...")
    _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
    
    # Test connection
    _client.admin.command("ping")
    logger.info("MongoDB Atlas connected successfully.")
    
    _db = _client.get_database(DB_NAME)
    
    # Ensure unique index on email
    try:
        _db.users.create_index("email", unique=True)
    except Exception as ie:
        logger.warning(f"Could not initialize unique index on users.email: {ie}")

    return _db


def get_users_collection() -> Collection:
    """Return the users collection."""
    db = get_database()
    return db.get_collection("users")
