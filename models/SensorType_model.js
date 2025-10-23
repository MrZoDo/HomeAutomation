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


//Reads the SensorTypes entries from database
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


// Add sensor type to database
async function addSensorType(sensorType) {
    console.log('Model: Request to save new Sensor Type');
    var instance = new MySensorType();
    instance.sensor_type = sensorType;
    return instance.save();
}


// Deletes a sensorType entry from the database
async function delSensorType(sensorType) {
    console.log('Model: Request to delete a Sensor Type ->', sensorType);

    try {
        const result = await MySensorType.deleteOne({ sensor_type: sensorType });
        return result;  // { acknowledged: true, deletedCount: 1 } if successful
    } catch (error) {
        console.error('Error deleting sensor type:', error);
        throw error;
    }
}


// Exports
module.exports.loadSensorTypes = loadSensorTypes;
module.exports.addSensorType = addSensorType;
module.exports.delSensorType = delSensorType;

