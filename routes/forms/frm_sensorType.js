var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('Route: S-a primit call pentru form-ul de SensorType');

    var st = require('../../models/SensorType_model.js');

    st.loadSensorTypes()
        .then(result => {
        // Handle success: result is the list with Sensor Types
            console.log('Route: Model Response->Sensor Type list:', result);
            res.render('forms/frm_sensorType', { sensors: result });
        })
         .catch(err => {
        // Handle error (e.g., validation error, unique constraint violation)
            console.error('Error loading Sensor Types:', err);
            res.status(500).json({ error: 'Failed to load sensor types' });
        });

});

module.exports = router;
