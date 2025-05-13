"""
Database connection module
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

def connect():
    """Connect to MongoDB and return client"""
    return MongoClient(os.getenv('MONGO_URI')) 