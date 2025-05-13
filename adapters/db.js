// This file helps us talk to MongoDB
import { MongoClient } from 'mongodb';

// Connect to MongoDB and return the connection
// The connection details are in the MONGO_URI environment variable
export default () => new MongoClient(process.env.MONGO_URI).connect(); 