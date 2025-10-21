var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//Conectare la baza de date locala
connect();

function connect() {

    //mongoose.Promise = global.Promise;
    //mongoose.connect('mongodb://localhost/ESP');
    // Use native JavaScript promises
    mongoose.Promise = global.Promise;

    // Connect to MongoDB
    mongoose.connect('mongodb://localhost:27017/ESP')
        .then(() => {
        console.log('✅ Connected to MongoDB successfully');
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err.message);
        });
}
function disconnect() {mongoose.disconnect()}

