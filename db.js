// Database connection module
import { MongoClient } from 'mongodb';
import 'dotenv/config';
// Export function that makes a new connection when called
export default () => new MongoClient(process.env.MONGO_URI).connect(); 