var roomTemp = require('./models/RoomTemp_model.js');
var tempSensor = require('./models/TempSensor_model.js');
var sensor = require('./models/Sensor_model.js');

var mqtt = require('mqtt');
var server = mqtt.connect('mqtt://localhost', {
    cmd: 'connect'
    , protocolId: 'MQTT' // or 'MQIsdp' in MQTT 3.1.1
    , protocolVersion: 4 // or 3 in MQTT 3.1
    , clean: true // or false
    , clientId: 'Server'
    , keepalive: 0 // seconds, 0 is the default, can be any positive number
    , username: 'matteo'
    , password: new Buffer.from('collina') // passwords are buffers
    , will: {
        topic: 'Server/status'
        , payload: new Buffer.from('dead') // payloads are buffers
    }
});


// --- In-memory cache ---
const roomCache = {}; // { roomName: { setpoint, lastTemperature } }

// --- Load room setpoints into cache at startup ---
async function loadRoomCache() {
    const rooms = await tempSensor.loadSetPoint();
    rooms.forEach((r) => {
        roomCache[r.room] = { 
            sensor_name: r.sensor_name,
            temp_setpoint: r.temp_setpoint, 
            last_temperature: r.last_temperature,
            last_humidity: r.last_humidity
        };
    });
    console.log("✅ Room cache loaded:", roomCache);
};

loadRoomCache();

server.on('connect', function(){
    // server.subscribe('Temp/Cam1/Raspuns');
    // server.subscribe('Temp/Cam2/Raspuns');
    server.subscribe('RoomTemp/Raspuns');
    server.subscribe('RoomTemp/ChangeSetpoint');
    server.subscribe('RoomTemp/Setpoint/Confirmation');
    server.subscribe('RoomName/Get');
    server.subscribe('OnOff/Confirm');

    /**ASCULT MESAJELE**/
    /****************START************************/
    server.on('message', async function(topic, message, payload) {
            try {
                //Verific topic-ul
                switch (topic) {
                    case "RoomTemp/Raspuns" :
                        console.log('Am primit raspunsul din call-ul de Crone : %s',message);
                        var messageData = JSON.parse(message);
                        var room = messageData.ESP;
                        var temperatura = messageData.TEMP;
                        var umiditatea = messageData.HUM;
                        //var Data = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        // var DataTMP = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var DataTMP = new Date();
                        DataTMP.setHours( DataTMP.getHours() + 2 );
                        DataTMP = DataTMP.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var Data = new Date();
                        var An    =  Data.getFullYear();
                        var Luna  =  Data.getMonth()+1;
                        var Ziua  =  Data.getDate();
                        var Ora   = Data.getHours();
                        var Minut = Data.getMinutes();
                        /*
                         console.log('ID : %s',tempID);
                         console.log('Temp : %s',temperatura);
                         console.log('Umid : %s',umiditatea);
                         console.log('DataTMP : %s',DataTMP);
                         console.log('Data : %s',Data);
                         console.log('An : %s',An);
                         console.log('Luna : %s',Luna);
                         console.log('Ziua : %s',Ziua);
                         console.log('Ora : %s',Ora);
                         console.log('Minut : %s',Minut);
                         */
                        //--- Save to Database ---
                        roomTemp.addTemp(room, temperatura, umiditatea, DataTMP, An, Luna, Ziua, Ora, Minut, function(err, Temp){
                            if (err) console.log(err);
                        });


                        if (!roomCache[room]) {
                            console.warn(`⚠️ No cache entry for ${room}, using default setpoint 20°C`);
                            roomCache[room] = { 
                                temp_setpoint: 20, 
                                last_temperature: temperatura,
                                last_humidity: umiditatea
                            };
                        }

                        // --- Update cache ---
                        roomCache[room] = roomCache[room] || {};
                        roomCache[room].last_temperature = temperatura;
                        roomCache[room].last_humidity = umiditatea;
                        console.log(`Cache for ${room}:`, JSON.stringify(roomCache[room], null, 2));

                        // --- Compare and trigger TempOff if needed ---
                        if (temperatura > roomCache[room].temp_setpoint) {
                            const topicOff = `RoomTemp/TempOff/${room}`;
                            console.log( `${room}: ${temperatura}°C > ${roomCache[room].temp_setpoint}°C → sending ${topicOff}`);
                            server.publish(topicOff, 'OFF');
                        }

                        break;

                    case "RoomTemp/ChangeSetpoint" :
                        console.log('Received RoomTemp/ChangeSetpoint request:', message.toString());
                        try {
                            const messageData = JSON.parse(message.toString());
                            const room = messageData.ROOM;
                            const newSetpoint = messageData.SETPOINT;
                            
                            console.log(`Updating setpoint for room "${room}" to ${newSetpoint}`);
                            
                            // Update in database
                            await tempSensor.updateTempSetpoint(room, newSetpoint);
                            
                            // Update in cache
                            if (roomCache[room]) {
                                roomCache[room].temp_setpoint = newSetpoint;
                                console.log(`✅ Setpoint updated for ${room}:`, JSON.stringify(roomCache[room], null, 2));
                            } else {
                                console.warn(`⚠️ Room not found in cache: ${room}`);
                            }
                        } catch (err) {
                            console.error('Error processing RoomTemp/ChangeSetpoint:', err);
                        }
                        break;

                    case "RoomName/Get" :
                        console.log('Received RoomName/Get request:', message.toString());
                        try {
                            const messageData = JSON.parse(message.toString());
                            const sensorId = messageData.Sensor_ID;
                            const sensorData = await sensor.findSensorById(sensorId);
                            
                            if (sensorData) {
                                const responseData = {
                                    sensor_id: sensorData.sensorID,
                                    room: sensorData.room
                                };
                                console.log('Publishing RoomName/Response:', JSON.stringify(responseData));
                                server.publish('RoomName/Response', JSON.stringify(responseData));
                            } else {
                                console.warn(`⚠️ Sensor not found for ID: ${sensorId}`);
                            }
                        } catch (err) {
                            console.error('Error processing RoomName/Get:', err);
                        }
                        break;
                    default:
                        console.log("Server a primit mesaj pe topic necunoscut");
                }
            } catch (err) {
                console.error("Error handling MQTT message:", err);
            }

    });

    /****************END************************/

    }
);


/**DEFINIRE FUNCTII**/

/**1- Citesc si salvez temperatura din toate camerele**/
function SaveRoomTemp(){
    server.publish('RoomTemp/Cerere', 'GET');
    console.log('Serverul a trimis request de temperatura');
}

function LedOn(){
    server.publish('LED', 'ON');
    console.log('Am aprins LED');
}

function LedOff(){
    server.publish('LED', 'OFF');
    console.log('Am publigat OFF');

}

function GetTemp(camId){
    server.publish('Temp/Cam'+camId+'/Cerere', 'GET');
    console.log('Serverul a trimis request pentru CAM2');
    return new Promise(function(resolve, reject ){

        server.once('message',function(topic, message, payload) {
            //Verific topic-ul
            switch (topic) {
                case "Temp/Cam"+camId+"/Raspuns" :
                    var response;
                    response = message.toString();
                    resolve(response);
                    break;
                default:
                    reject("No message");

            }
        }) ;
    });

    console.log('Am trimis request de temperatura');
}

module.exports.ON = LedOn;
module.exports.OFF = LedOff;
module.exports.GetTemp = GetTemp;
module.exports.roomCache = roomCache;
module.exports.SaveRoomTemp = SaveRoomTemp;




