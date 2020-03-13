var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports.mongoose = mongoose;
module.exports.Schema = Schema;



//Conectare la baza de date locala
connect();

function connect() {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/ESP');
}
function disconnect() {mongoose.disconnect()}

