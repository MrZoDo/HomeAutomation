/**
 * Created by Zodo on 10/17/2025.
 */
var db = require('../lib/database_connection');
var sensorTypeSchema = new db.Schema({
    sensor_type :    {type: String, unique: true}
})

//'sensorType' is the name of the collection the model is for
//Mongoose automatically looks for the plural, lowercased version the model name. In this case the collection is actually called 'sensorTypes'
var MySensorType = db.mongoose.model('sensorType', sensorTypeSchema);


// Add sensor type to database
async function addSensorType(sensor_type) {
    console.log('Model: Request to save new Sensor Type');
    var instance = new MySensorType();
    instance.sensor_type = sensor_type;
    return instance.save();
}

/**
 * Loads all documents from a given Mongoose model (collection).
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {Object} [filter={}] - Optional MongoDB query filter.
 * @param {Object} [projection={}] - Optional projection to limit returned fields.
 * @returns {Promise<Array>} - Resolves with an array of documents.
 */
async function loadSensorTypes() {
    try {
        //MySensorType.find({}, 'sensor_type') → gets all docs but only includes the sensor_type field
        const docs = await MySensorType.find({}, 'sensor_type').lean();  // lean() returns plain JS objects
        return docs;
    } catch (error) {
        console.error('Error loading collection:', error);
        throw error;
    }
}




// Exports
module.exports.addSensorType = addSensorType;
module.exports.loadSensorTypes = loadSensorTypes;
