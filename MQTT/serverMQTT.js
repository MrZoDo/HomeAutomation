var roomTemp = require('../models/RoomTemp_model.js');
var tempSensor = require('../models/TempSensor_model.js');
var sensor = require('../models/Sensor_model.js');
var db = require('../lib/database_connection');
var mqttHandlers = require('./mqttHandlers');

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
                sensor_status: 'Offline' // Default to Offline
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
server.on('message', async function (topic, message, payload) {
    try {
        // --- Special handling for wildcard RoomStatus ---
        if (topic.startsWith('RoomStatus/')) {
            await mqttHandlers.handleRoomStatusUpdate(topic, message, roomCache);
            return;
        }

        //Verific topic-ul
        switch (topic) {
            case "RoomTemp/Raspuns":
                await mqttHandlers.handleRoomTempResponse(message, roomCache, roomTemp, server);
                break;

            case "RoomTemp/ChangeSetpoint":
                await mqttHandlers.handleChangeSetpoint(message, roomCache, tempSensor);
                break;

            case "RoomName/Get":
                await mqttHandlers.handleRoomNameGet(message, sensor, server);
                break;

            // "RoomStatus/Raspuns" removed as we use RoomStatus/+ wildcard now.
            // If we needed to support the legacy one, we could add it here or map it.
            // But improving logic implies we move to the new structure.

            case "RoomTemp/Setpoint/Confirmation":
                await mqttHandlers.handleSetpointConfirmation(message, roomCache, pendingSetpointConfirmations, tempSensor);
                break;

            default:
                console.log("Server a primit mesaj pe topic necunoscut: " + topic);
        }
    } catch (err) {
        console.error("Error handling MQTT message:", err);
    }
});


// --- Server connect event handler ---
server.on('connect', function () {
    console.log('✅ MQTT Server Connected');

    //========================
    // Subscribe to topics
    //========================

    // Subscribe to RoomTemp/Raspuns to receive the temperature and humidity from the sensors
        server.subscribe('RoomTemp/Raspuns');
    // Subscribe to RoomTemp/ChangeSetpoint to receive the new setpoint value from the sensors
        server.subscribe('RoomTemp/ChangeSetpoint');
    // Subscribe to RoomTemp/Setpoint/Confirmation to receive the confirmation from the sensors that the setpoint has been updated
        server.subscribe('RoomTemp/Setpoint/Confirmation');
    // Subscribe to RoomName/Get to receive the requests for room name from the sensors
        server.subscribe('RoomName/Get');
    // Subscribe to OnOff/Confirm to receive the confirmation from the user that the device has been turned on or off
        server.subscribe('OnOff/Confirm');
    // Subscribe to RoomStatus wildcard to receive retained messages and updates/LWT
    // We rely on sensors sending retained "Online" messages and LWT "Offline".
        server.subscribe('RoomStatus/+');

});

server.on('reconnect', function () {
    console.log('🔄 MQTT Server Reconnecting');
});

/**DEFINIRE FUNCTII**/

// --- Citesc si salvez temperatura din toate camerele**/
function SaveRoomTemp() {
    server.publish('RoomTemp/Cerere', 'GET');
    console.log('Serverul a trimis request de temperatura');
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





function GetTemp(camId) {
    server.publish('Temp/Cam' + camId + '/Cerere', 'GET');
    console.log('Serverul a trimis request pentru CAM2');
    return new Promise(function (resolve, reject) {

        server.once('message', function (topic, message, payload) {
            //Verific topic-ul
            switch (topic) {
                case "Temp/Cam" + camId + "/Raspuns":
                    var response;
                    response = message.toString();
                    resolve(response);
                    break;
                default:
                    reject("No message");

            }
        });
    });

    console.log('Am trimis request de temperatura');
}

module.exports.GetTemp = GetTemp;
module.exports.roomCache = roomCache;
module.exports.SaveRoomTemp = SaveRoomTemp;
module.exports.publishSetpointUpdate = publishSetpointUpdate;
