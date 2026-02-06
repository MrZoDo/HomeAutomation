var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

// --- Database connection promise ---
let dbConnected = null;

//Conectare la baza de date locala
dbConnected = connect();
module.exports.dbConnected = dbConnected;

async function connect() {

    //mongoose.Promise = global.Promise;
    //mongoose.connect('mongodb://localhost/ESP');
    // Use native JavaScript promises
    mongoose.Promise = global.Promise;

    // Connect to MongoDB
    try {
        await mongoose.connect('mongodb://localhost:27017/ESP');
        console.log('✅ Connected to MongoDB successfully');
        
        // Wait for connection to be ready for operations
        await new Promise(resolve => {
            if (mongoose.connection.readyState === 1) {
                resolve();
            } else {
                mongoose.connection.once('open', resolve);
            }
        });
        
        console.log('✅ MongoDB connection ready for operations');
        return true;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
    }
}

function disconnect() {mongoose.disconnect()}

