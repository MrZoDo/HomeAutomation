/**
 * Created by Zodo on 10/23/2025.
 */

var db = require('../lib/database_connection');
var roomSchema = new db.Schema({
    room_name :    {type: String, unique: true}
})

//'room' is the name of the collection the model is for
//Mongoose automatically looks for the plural, lowercased version the model name. In this case the collection is actually called 'rooms'
var MyRoom = db.mongoose.model('room', roomSchema);


//Reads the Room entries from database
async function loadRooms() {
    try {
        //MyRoom.find({}, 'room_name') → gets all docs but only includes the sensor_type field
        const docs = await MyRoom.find({}, 'room_name').lean();  // lean() returns plain JS objects
        return docs;
    } catch (error) {
        console.error('Error loading collection:', error);
        throw error;
    }
}


// Add a new room to database
async function addRoom(roomName) {
    console.log('Model: Request to save new Room');
    var instance = new MyRoom();
    instance.room_name = roomName;
    return instance.save();
}


// Deletes a Room entry from the database
async function delRoom(roomName) {
    console.log('Model: Request to delete a Room ->', roomName);
    try {
        const result = await MyRoom.deleteOne({ room_name: roomName });
        return result;  // { acknowledged: true, deletedCount: 1 } if successful
    } catch (error) {
        console.error('Error deleting room:', error);
        throw error;
    }
}


// Exports
module.exports.loadRooms = loadRooms;
module.exports.addRoom = addRoom;
module.exports.delRoom = delRoom;

