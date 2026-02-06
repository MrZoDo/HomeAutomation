
// --- Handler for RoomTemp/Raspuns ---
async function handleRoomTempResponse(message, roomCache, roomTempModel, server) {
    console.log('Am primit raspunsul din call-ul de Crone : %s', message);
    var messageData = JSON.parse(message);
    var room = messageData.ESP;
    var temperatura = messageData.TEMP;
    var umiditatea = messageData.HUM;
    var DataTMP = new Date();
    DataTMP.setHours(DataTMP.getHours() + 2);
    DataTMP = DataTMP.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var Data = new Date();
    var An = Data.getFullYear();
    var Luna = Data.getMonth() + 1;
    var Ziua = Data.getDate();
    var Ora = Data.getHours();
    var Minut = Data.getMinutes();

    //--- Save to Database ---
    const cacheEntry = roomCache[room] || {};
    roomTempModel.addTemp(room, cacheEntry.floor, cacheEntry.sensorID, temperatura, umiditatea, DataTMP, An, Luna, Ziua, Ora, Minut, function (err, Temp) {
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
        console.log(`${room}: ${temperatura}°C > ${roomCache[room].temp_setpoint}°C → sending ${topicOff}`);
        server.publish(topicOff, 'OFF');
    }
}

// --- Handler for RoomTemp/ChangeSetpoint ---
async function handleChangeSetpoint(message, roomCache, tempSensorModel) {
    console.log('Received RoomTemp/ChangeSetpoint request:', message.toString());
    try {
        const messageData = JSON.parse(message.toString());
        const room = messageData.ROOM;
        const newSetpoint = messageData.SETPOINT;

        console.log(`Updating setpoint for room "${room}" to ${newSetpoint}`);

        // Update in database
        await tempSensorModel.updateTempSetpoint(room, newSetpoint);

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
}

// --- Handler for RoomName/Get ---
async function handleRoomNameGet(message, sensorModel, server) {
    console.log('Received RoomName/Get request:', message.toString());
    try {
        const messageData = JSON.parse(message.toString());
        const sensorId = messageData.Sensor_ID;
        const sensorData = await sensorModel.findSensorById(sensorId);

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
}

// --- Handler for RoomStatus/+ ---
async function handleRoomStatusUpdate(topic, message, roomCache) {
    console.log(`Received status update on ${topic}: ${message.toString()}`);
    try {
        // Extract room name from topic: RoomStatus/<RoomName>
        const parts = topic.split('/');
        // parts[0] is RoomStatus, parts[1] is RoomName
        if (parts.length < 2) {
            console.warn(`⚠️ Invalid topic format for RoomStatus: ${topic}`);
            return;
        }
        const room = parts[1];
        const status = message.toString(); // "Online" or "Offline"

        if (room) {
            // Update the cache with sensor status
            if (roomCache[room]) {
                roomCache[room].sensor_status = status;
                console.log(`✅ Room ${room} status updated to ${status}:`, JSON.stringify(roomCache[room], null, 2));
            } else {
                console.warn(`⚠️ Room not found in cache: ${room}`);
            }
        }
    } catch (err) {
        console.error(`Error processing status update for ${topic}:`, err);
    }
}

// --- Handler for RoomTemp/Setpoint/Confirmation ---
async function handleSetpointConfirmation(message, roomCache, pendingSetpointConfirmations, tempSensorModel) {
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
                await tempSensorModel.updateTempSetpoint(room, receivedSetpoint);

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
}

module.exports = {
    handleRoomTempResponse,
    handleChangeSetpoint,
    handleRoomNameGet,
    handleRoomStatusUpdate,
    handleSetpointConfirmation
};
