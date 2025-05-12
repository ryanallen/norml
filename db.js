require('dotenv').config();  // Load the secret password from the .env file

const {MongoClient} = require('mongodb');  // Get the tool that helps us talk to MongoDB

module.exports = () => new MongoClient(process.env.MONGO_URI).connect();  // Give other files a way to connect to our database 