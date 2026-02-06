var roomTemp = require('./models/RoomTemp_model.js');
var tempSensor = require('./models/TempSensor_model.js');
var sensor = require('./models/Sensor_model.js');
var db = require('./lib/database_connection');

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
let roomStatusChecked = false; // Flag to track if checkRoomStatus has been called

// --- Pending setpoint confirmations ---
const pendingSetpointConfirmations = {}; // { roomName: { resolve, reject, timeout, sentSetpoint } }

// --- Load room setpoints into cache at startup ---
async function loadRoomCache() {
    try {
        const rooms = await tempSensor.loadSetPoint();
        rooms.forEach((r) => {
            roomCache[r.room] = { 
                sensorID: r.sensorID,
                floor: r.floor,
                sensor_name: r.sensor_name,
                temp_setpoint: r.temp_setpoint, 
                last_temperature: r.last_temperature,
                last_humidity: r.last_humidity,
                sensor_status: 'Offline'
            };
        });
        console.log("✅ Room cache loaded:", roomCache);
    } catch (err) {
        console.error('❌ Error loading room cache:', err.message);
    }
}

// --- Initialize: Wait for DB connection, then load cache ---
(async () => {
    try {
        console.log('⏳ Waiting for MongoDB connection...');
        await db.dbConnected;
        console.log('✅ MongoDB ready, loading room cache...');
        await loadRoomCache();
    } catch (err) {
        console.error('❌ Failed to initialize:', err.message);
    }
})();

// --- Register MQTT message handler once ---
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
                var DataTMP = new Date();
                DataTMP.setHours( DataTMP.getHours() + 2 );
                DataTMP = DataTMP.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                var Data = new Date();
                var An    =  Data.getFullYear();
                var Luna  =  Data.getMonth()+1;
                var Ziua  =  Data.getDate();
                var Ora   = Data.getHours();
                var Minut = Data.getMinutes();

                //--- Save to Database ---
                const cacheEntry = roomCache[room] || {};
                roomTemp.addTemp(room, cacheEntry.floor, cacheEntry.sensorID, temperatura, umiditatea, DataTMP, An, Luna, Ziua, Ora, Minut, function(err, Temp){
                    if (err) console.log(err);
                });

                if (!roomCache[room]) {
                    console.warn(`⚠️ No cache entry for ${room}, using default setpoint 20°C`);
                    roomCache[room] = { 
                        sensorID: undefined,
                        floor: undefined,
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
                            room: sensorData.room,
                            sensor_name: sensorData.sensor_name
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

            case "RoomStatus/Raspuns" :
                console.log('Received RoomStatus/Raspuns:', message.toString());
                try {
                    const messageData = JSON.parse(message.toString());
                    const room = messageData.ROOM;
                    const status = messageData.Status;
                    
                    if (room && status) {
                        // Update the cache with sensor status
                        if (roomCache[room]) {
                            roomCache[room].sensor_status = status;
                            console.log(`✅ Room ${room} status updated to ${status}:`, JSON.stringify(roomCache[room], null, 2));
                        } else {
                            console.warn(`⚠️ Room not found in cache: ${room}`);
                        }
                    } else {
                        console.warn(`⚠️ Invalid RoomStatus message format:`, messageData);
                    }
                } catch (err) {
                    console.error('Error processing RoomStatus/Raspuns:', err);
                }
                break;

            case "RoomTemp/Setpoint/Confirmation" :
                console.log('Received RoomTemp/Setpoint/Confirmation:', message.toString());
                try {
                    const confirmationData = JSON.parse(message.toString());
                    const room = confirmationData.ROOM;
                    const receivedSetpoint = confirmationData.SETPOINT;
                    
                    if (pendingSetpointConfirmations[room]) {
                        const pending = pendingSetpointConfirmations[room];
                        
                        // Check if the setpoint matches
                        if (receivedSetpoint === pending.sentSetpoint) {
                            console.log(`✅ Setpoint confirmation matches for ${room}: ${receivedSetpoint}°C`);
                            
                            // Update in database
                            await tempSensor.updateTempSetpoint(room, receivedSetpoint);
                            
                            // Update in cache
                            if (roomCache[room]) {
                                roomCache[room].temp_setpoint = receivedSetpoint;
                                console.log(`✅ Room cache updated for ${room}:`, JSON.stringify(roomCache[room], null, 2));
                            }
                            
                            // Resolve the pending promise
                            pending.resolve({ success: true, newSetpoint: receivedSetpoint });
                        } else {
                            console.warn(`⚠️ Setpoint confirmation mismatch for ${room}: sent ${pending.sentSetpoint}°C, received ${receivedSetpoint}°C`);
                            pending.reject(new Error(`Setpoint mismatch: sent ${pending.sentSetpoint}°C, received ${receivedSetpoint}°C`));
                        }
                        
                        // Clean up
                        clearTimeout(pending.timeout);
                        delete pendingSetpointConfirmations[room];
                    } else {
                        console.warn(`⚠️ No pending confirmation for room: ${room}`);
                    }
                } catch (err) {
                    console.error('Error processing RoomTemp/Setpoint/Confirmation:', err);
                }
                break;

            default:
                console.log("Server a primit mesaj pe topic necunoscut");
        }
    } catch (err) {
        console.error("Error handling MQTT message:", err);
    }
});


// --- Server connect event handler ---
server.on('connect', function(){
    console.log('✅ MQTT Server Connected');
    
    // Subscribe to topics
    server.subscribe('RoomTemp/Raspuns');
    server.subscribe('RoomTemp/ChangeSetpoint');
    server.subscribe('RoomTemp/Setpoint/Confirmation');
    server.subscribe('RoomName/Get');
    server.subscribe('OnOff/Confirm');
    server.subscribe('RoomStatus/Raspuns');
    
    // --- Check room status on MQTT connection with delay ---
    if (!roomStatusChecked) {
        console.log('⏳ Waiting 5 seconds before checking room status...');
        setTimeout(() => {
            console.log('🚀 Triggering checkRoomStatus from connect handler');
            checkRoomStatus();
        }, 5000);
    } else {
        console.log('⚠️ checkRoomStatus already called');
    }
});

server.on('reconnect', function(){
    console.log('🔄 MQTT Server Reconnecting');
});

/**DEFINIRE FUNCTII**/

// --- Citesc si salvez temperatura din toate camerele**/
function SaveRoomTemp(){
    server.publish('RoomTemp/Cerere', 'GET');
    console.log('Serverul a trimis request de temperatura');
}

// --- Check room status and request status from all sensors ---
// This function is designed to run only once at startup
function checkRoomStatus(){
    if (roomStatusChecked) {
        console.log('⚠️ Room status already checked, skipping...');
        return;
    }
    roomStatusChecked = true;
    server.publish('RoomStatus/Cerere', 'GET');
    console.log('✅ Room status check initiated - GET request published on RoomStatus/Cerere');
}

// --- Publish setpoint update and wait for confirmation ---
function publishSetpointUpdate(room, newSetpoint, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        try {
            const messageData = {
                ROOM: room,
                SETPOINT: newSetpoint
            };
            
            // Create timeout
            const timeoutId = setTimeout(() => {
                delete pendingSetpointConfirmations[room];
                reject(new Error(`Timeout waiting for setpoint confirmation for ${room}`));
            }, timeoutMs);
            
            // Store the pending confirmation handler
            pendingSetpointConfirmations[room] = {
                resolve: resolve,
                reject: reject,
                timeout: timeoutId,
                sentSetpoint: newSetpoint
            };
            
            // Publish to MQTT topic
            const topic = `RoomTemp/Setpoint/${room}`;
            console.log(`Publishing to ${topic}:`, JSON.stringify(messageData));
            server.publish(topic, JSON.stringify(messageData));
            
        } catch (err) {
            reject(err);
        }
    });
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

module.exports.GetTemp = GetTemp;
module.exports.roomCache = roomCache;
module.exports.SaveRoomTemp = SaveRoomTemp;
module.exports.checkRoomStatus = checkRoomStatus;
module.exports.publishSetpointUpdate = publishSetpointUpdate;




