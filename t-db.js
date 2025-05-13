console.log('Connecting to MongoDB...');
require('./db')().then(c => {
    console.log('Connected to MongoDB ✓');
    console.log('Database:', c.db().databaseName);
    console.log('Server:', c.options.srvHost);
    c.close();
    console.log('Connection closed ✓');
    process.exit(0);
}).catch(e => {
    console.error('Connection failed ✗');
    console.error('Error:', e.message);
    process.exit(1);
}); 