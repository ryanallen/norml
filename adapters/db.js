// Database adapter - Connects to external MongoDB system
import { MongoClient } from 'mongodb';
import 'dotenv/config'; // Load environment variables

// Function that creates and returns a MongoDB connection
export default () => new MongoClient(process.env.MONGO_URI).connect(); 