/**
 * Created by Zodo on 10/18/2025.
 */
var express = require('express');
var router = express.Router();


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
module.exports = router;
