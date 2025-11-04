/**
 * Created by Zodo on 11/3/2025.
 */
var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    console.log('Route:S-a primit call pentru form-ul de Sensors');

    try {
        const rm = require('../../models/Room_model.js');
        const st = require('../../models/SensorType_model.js');
        const se = require('../../models/Sensor_model.js');

        const rooms_res = await rm.loadRooms();
        console.log('Route: Model Responded with Room list');

        const sensorTypes_res = await st.loadSensorTypes();
        console.log('Route: Model Responded with Sensor Types list');

        const sensors_res = await se.loadSensors();
        console.log('Route: Model Responded with Sensors list');

        res.render('forms/frm_sensors', {
            rooms: rooms_res,
            sensorTypes: sensorTypes_res,
            sensors: sensors_res
        });
    } catch (err) {
        console.error('Error loading data:', err);
        res.status(500).json({ error: 'Failed to load form data' });
    }


});

module.exports = router;