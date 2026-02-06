/** Created by Zodo on 10/28/2025. */


//This model is used to save only the sensors that read temperature (and humidity).
//These sensors are also saved in a collection where we have all sensors.
var db = require('../lib/database_connection');
var tempSensorSchema = new db.Schema({
    sensorID :      {type: String, unique: true, required: true},  //Unique ID for each sensor
    room :          {type: String, required: true}, //Selected from the list of defined rooms
    floor :         {type: String}, //Floor associated with the room
    sensor_name :   {type: String, required: true}, //Manually inserted
    sensor_type :   {type: String, required: true},  //Selected from the list of defined types
    temp_setpoint : {type: Number, default: 20},
    last_temperature : {type: Number, default: null}, //Last temperature reading
    last_humidity :  {type: Number, default: null} //Last humidity reading
})

// Create a compound unique index
tempSensorSchema.index({ room: 1, sensor_type: 1 }, { unique: true });

//'tempSensor' is the name of the collection the model is for
//Mongoose automatically looks for the plural, lowercased version of the model name. In this case the collection is actually called 'tempSensors'
var MyTempSensor = db.mongoose.model('tempSensor', tempSensorSchema);
// Note: Mongoose will automatically create indexes on first connection, no need to call ensureIndexes()

//Reads the roomSensor entries from database
async function loadSetPoint() {
    try {
        //MyTempSensor.find({}, 'sensorID room floor sensor_name temp_setpoint last_temperature last_humidity') → gets all docs with these fields
        const docs = await MyTempSensor.find({}, 'sensorID room floor sensor_name temp_setpoint last_temperature last_humidity').lean();  // lean() returns plain JS objects
        return docs;
    } catch (error) {
        console.error('Error loading collection:', error);
        throw error;
    }
}


// Add temp sensor to database
async function addTempSensor(sensorID,room,sensorName,sensorType,floor) {
    console.log('Model: Request to save new Temp Sensor');
    var instance = new MyTempSensor();
    instance.sensorID = sensorID;
    instance.room = room;
    instance.floor = floor;
    instance.sensor_name = sensorName;
    instance.sensor_type = sensorType;
    return instance.save();
}


// Deletes a temp sensor entry from the database
async function delTempSensor(sensorID) {
    console.log('Model: Request to delete a Temp Sensor  ->', sensorID);

    try {
        const result = await MyTempSensor.deleteOne({ sensorID: sensorID });
        return result;  // { acknowledged: true, deletedCount: 1 } if successful
    } catch (error) {
        console.error('Error deleting sensor:', error);
        throw error;
    }
}


// Updates the temp_setpoint for a room
async function updateTempSetpoint(room, newSetpoint) {
    console.log('Model: Request to update Temp Setpoint for room:', room, 'to:', newSetpoint);

    try {
        const result = await MyTempSensor.updateOne({ room: room }, { temp_setpoint: newSetpoint });
        return result;  // { acknowledged: true, modifiedCount: 1 } if successful
    } catch (error) {
        console.error('Error updating temp setpoint:', error);
        throw error;
    }
}


// Exports
module.exports.loadSetPoint = loadSetPoint;
module.exports.addTempSensor = addTempSensor;
module.exports.delTempSensor = delTempSensor;
module.exports.updateTempSetpoint = updateTempSetpoint;

