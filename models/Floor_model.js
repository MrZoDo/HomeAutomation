/**
 * Created by Zodo on 10.01.2026.
 */

var db = require('../lib/database_connection');
var floorSchema = new db.Schema({
    floor_name :    {type: String, unique: true}
})

//'floor' is the name of the collection the model is for
//Mongoose automatically looks for the plural, lowercased version the model name. In this case the collection is actually called 'floors'
var MyFloor = db.mongoose.model('floor', floorSchema);


//Reads the Floor entries from database
async function loadFloors() {
    try {
        //MyFloor.find({}, 'floor_name') → gets all docs but only includes the floor_name field
        const docs = await MyFloor.find({}, 'floor_name').lean();  // lean() returns plain JS objects
        return docs;
    } catch (error) {
        console.error('Error loading collection:', error);
        throw error;
    }
}


// Add a new floor to database
async function addFloor(floorName) {
    console.log('Model: Request to save new Floor');
    var instance = new MyFloor();
    instance.floor_name = floorName;
    return instance.save();
}


// Deletes a Floor entry from the database
async function delFloor(floorName) {
    console.log('Model: Request to delete a Floor ->', floorName);
    try {
        const result = await MyFloor.deleteOne({ floor_name: floorName });
        return result;  // { acknowledged: true, deletedCount: 1 } if successful
    } catch (error) {
        console.error('Error deleting floor:', error);
        throw error;
    }
}


// Exports
module.exports.loadFloors = loadFloors;
module.exports.addFloor = addFloor;
module.exports.delFloor = delFloor;
