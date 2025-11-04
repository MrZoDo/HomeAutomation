var db = require('../lib/database_connection');
var RoomTempSchema = new db.Schema({
    room :          {type: String, unique: false},
    temperatura :   {type: Number, unique: false},
    umiditatea :    {type: Number, unique: false},
    Data:           {type: String, unique: false},
    An :            {type: Number, unique: false},
    Luna :          {type: Number, unique: false},
    Ziua :          {type: Number, unique: false},
    Ora :           {type: Number, unique: false},
    Minut :         {type: Number, unique: false}
})
var MyTemp = db.mongoose.model('RoomTemp', RoomTempSchema);



// Add temp to database
function addTemp(room, temperatura, umiditatea, Data, An, Luna, Ziua, Ora, Minut, callback) {
    console.log('Model: Request to save temp & hum');
    var instance = new MyTemp();
    instance.room = room ;
    instance.temperatura = temperatura ;
    instance.umiditatea = umiditatea ;
    instance.Data = Data ;
    instance.An = An ;
    instance.Luna = Luna ;
    instance.Ziua = Ziua ;
    instance.Ora = Ora ;
    instance.Minut = Minut ;
    return instance.save();
}



//Get last date
 function getLastData(){
    return new Promise( function (resolve, reject) {
        MyTemp.find({},'Data',function (err, docs) {
            if(err){
                return reject(err)
            }
                return resolve(docs);
        }).sort({Data:-1}).limit(1);
    })
};


// Get temp from database
function getDbTemp(query){
    return new Promise( function (resolve, reject) {
        //console.log('Query pt functie:',query);
        MyTemp.find(query,'tempID temperatura  umiditatea Data',function (err, docs) {
            if(err){
                return reject(err)
            }
            return resolve(docs);
        })
            //.sort({Data:-1}).limit(2);
    })
};

// Exports
module.exports.addTemp = addTemp;
module.exports.getDbTemp = getDbTemp;
module.exports.getLastData = getLastData;