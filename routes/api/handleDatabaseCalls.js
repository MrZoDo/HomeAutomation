/** Created by Zodo on 10/18/2025. **/
var express = require('express');
var router = express.Router();

//=============================
// Handle calls for SensorType
//=============================
router.post('/addSensorType', async function(req, res, next) {
    console.log('API Route: S-a primit POST call pentru salvarea unei intari de tip "Sensor Type" ');
    var sensor_type = req.body.new_sensor_type;
    var st = require('../../models/SensorType_model.js');

    st.addSensorType(sensor_type)
        .then(result => {
        // Handle success: result is the saved document
            console.log('Route: Model Response->Sensor Type saved successfully:', result);
            res.send({ success: true });
         })
        .catch(err => {
        // Handle error (e.g., validation error, unique constraint violation)
            console.error('Error saving Sensor Type:', err);
        // Handle specific errors, e.g., Mongoose unique constraint violation (Code 11000)
            if (err.code === 11000) {
                return res.status(409).send('Sensor type already exists.');
            }else {
                res.status(500).send(err);
            }
        });

});

router.post('/deleteSensorType', async function(req, res, next) {
    console.log('API Route: S-a primit POST call pentru stergeres unei intari de tip "Sensor Type" ');
    var sensor_type = req.body.sensor_type;
    var st = require('../../models/SensorType_model.js');

    st.delSensorType(sensor_type)
        .then(result => {
        // Handle failure
         if (result.deletedCount === 0){
            console.error('No sensor was deleted');
            res.status(404).send("Sensor type not found");
            }

        console.log('Route: Model Response->Sensor Type deleted successfully');
        res.sendStatus(200);


    });
});

//========================
// Handle calls for Room
//========================
router.post('/addRoom', async function(req, res, next) {
    console.log('API Route: S-a primit POST call pentru salvarea unei intari de tip "Room" ');
    var roomName = req.body.new_room;
    var rm = require('../../models/Room_model.js');

    rm.addRoom(roomName)
        .then(result => {
        // Handle success: result is the saved document
            console.log('Route: Model Response->Room saved successfully:', result);
            res.send({ success: true });
        })
        .catch(err => {
        // Handle error (e.g., validation error, unique constraint violation)
            console.error('Error saving Room:', err);
        // Handle specific errors, e.g., Mongoose unique constraint violation (Code 11000)
            if (err.code === 11000) {
                return res.status(409).send('Room already exists.');
            }else {
                res.status(500).send(err);
            }
        });
});

router.post('/deleteRoom', async function(req, res, next) {
    console.log('API Route: S-a primit POST call pentru stergeres unei intari de tip "Room" ');
    var roomName = req.body.room;
    var rm = require('../../models/Room_model.js');

    rm.delRoom(roomName)
        .then(delResult => {
        console.log(delResult);
        // Handle failure
        if (delResult.deletedCount === 0){
            console.error('No room was deleted');
            res.status(404).send("Room not found");
            }

        console.log('Route: Model Response->Room deleted successfully');
        res.sendStatus(200);
        });
});

//==========================
// Handle calls for Sensors
//==========================
router.post('/addSensor', async function (req, res, next) {
    console.log('API Route: Received POST call to save a "Sensor" entry');

    try {
        const roomName = req.body.room;
        const sensorType = req.body.sensor_type;

        const se = require('../../models/Sensor_model.js');
        const savedSensor = await se.addSensor(roomName, sensorType);

        console.log('Route: Model Response -> Sensor saved successfully:', savedSensor);

        // If this is a "Termostat", save a corresponding TempSensor
        if (savedSensor.sensor_type === 'Termostat') {
            const ts = require('../../models/TempSensor_model.js');
            const sensorID = savedSensor.sensorID;

            try {
                const savedTempSensor = await ts.addTempSensor(sensorID, roomName, sensorType);
                console.log('Route: Model Response -> TempSensor saved successfully:', savedTempSensor);
            } catch (err) {
                console.error('Error saving TempSensor:', err);
                // If this fails, we can still respond, but mark partial success
                return res.status(500).json({
                    success: false,
                    message: 'Sensor saved, but failed to save TempSensor',
                    error: err.message,
                });
            }
        }

        res.json({ success: true, sensor: savedSensor });
    } catch (err) {
        console.error('Error saving sensor:', err);
        // Handle specific errors, e.g., Mongoose unique constraint violation (Code 11000)
        if (err.code === 11000) {
            return res.status(409).send('Sensor already exists.');
        }else {
            res.status(500).json({ success: false, error: err.message });
        }

    }
});

router.post('/deleteSensor', async function(req, res, next) {
    console.log('API Route: S-a primit POST call pentru stergeres unei intari de tip "Sensor" ');

    try{
        var sensorID = req.body.id;
        var se = require('../../models/Sensor_model.js');
        const deletedSensor = await se.delSensor(sensorID);
        console.log(deletedSensor);
        if (deletedSensor.deletedCount === 0){
            console.error('No sensor was deleted');
            res.status(404).send("Sensor not found");
        }else{
            console.log('Route: Model Response->Sensor deleted successfully');

            // Also try to delete from TempSensor
            try {
                const ts = require('../../models/TempSensor_model.js');
                const deletedTempSensor = await ts.delTempSensor(sensorID);
                if (deletedTempSensor.deletedCount === 1){
                    console.log('Route: Model Response -> TempSensor deleted successfully');
                }else{
                    console.log('Route: Model Response -> No sensor deleted from TempSensor.');
                }
            } catch (err) {
                console.error('Error deleting TempSensor:', err);

                return res.status(500).json({
                    success: false,
                    message: 'Sensor deleted, but failed to also delete from TempSensor',
                    error: err.message,
                });
            }

            console.log('Route: Model Response->Sensor deleted successfully');
            res.json({ success: true, sensor: deletedSensor });
        }
    } catch (err) {
        console.error('Error deleting sensor:', err);
        res.status(500).json({ success: false, error: err.message });
    }

});

module.exports = router;
