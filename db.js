require('dotenv').config();  // Read the password from .env file
const {MongoClient} = require('mongodb');  // Get the MongoDB connection function from the mongodb package
module.exports = () => new MongoClient(process.env.MONGO_URI).connect();  // Export a function that makes a new connection when called 