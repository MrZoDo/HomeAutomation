/**
 * Created by Zodo on 11/3/2025.
 */

var db = require('../lib/database_connection');
var sensorSchema = new db.Schema({
    sensorID :      {type: String, unique: true, required: true}, //Unique ID for each sensor
    room :          {type: String, required: true}, //Selected from the list of defined rooms
    sensor_name :   {type: String, required: true}, //Manually inserted
    sensor_type :   {type: String, required: true}  //Selected from the list of defined types

})
// Create a compound unique index
sensorSchema.index({ room: 1, sensor_type: 1 }, { unique: true });

//'sensor' is the name of the collection the model is for
//Mongoose automatically looks for the plural, lowercased version of the model name. In this case the collection is actually called 'sensors'
var MySensor = db.mongoose.model('sensor', sensorSchema);
//MySensor.ensureIndexes(); // or TempSensor.syncIndexes() for Mongoose 6+


//Reads the sensor entries from database
async function loadSensors() {
    try {
        const docs = await MySensor.find({}, 'sensorID room sensor_name sensor_type').lean();  // lean() returns plain JS objects
        return docs;
    } catch (error) {
        console.error('Error loading collection:', error);
        throw error;
    }
}

// Add sensor to database
async function addSensor(room,sensorName,sensorType) {
    try {
        console.log('Model: Request to save new Sensor');
        var instance = new MySensor();
        // Generate MongoDB-like ID
        var sensorId = new db.mongoose.Types.ObjectId();
        instance.sensorID = sensorId;
        instance.room = room;
        instance.sensor_name = sensorName;
        instance.sensor_type = sensorType;
        const result = await instance.save();
        return result;
    } catch (err) {
        throw err; // rethrow anything else
    }

}

// Deletes a sensor entry from the database
async function delSensor(sensorID) {
    console.log('Model: Request to delete a Sensor  ->', sensorID);

    try {
        const result = await MySensor.deleteOne({ sensorID: sensorID });
        return result;  // { acknowledged: true, deletedCount: 1 } if successful
    } catch (error) {
        console.error('Error deleting sensor:', error);
        throw error;
    }
}

// Exports
    module.exports.loadSensors = loadSensors;
    module.exports.addSensor = addSensor;
    module.exports.delSensor = delSensor;