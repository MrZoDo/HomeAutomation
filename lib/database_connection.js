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
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/ESP');
}
function disconnect() {mongoose.disconnect()}

