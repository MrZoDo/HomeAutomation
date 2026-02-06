/**
 * Created by Zodo on 01/10/2026.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('[FRM_FLOOR router]: S-a primit call pentru form-ul de Floor');
    var fm = require('../../models/Floor_model.js');

    fm.loadFloors()
        .then(result => {
        // Handle success: result is the list with Floors
            console.log('Route: Model Response->Floor list:', result);
            res.render('forms/frm_floor', { floors: result });
        })
        .catch(err => {
        // Handle error (e.g., validation error, unique constraint violation)
            console.error('Error loading Floors:', err);
            res.status(500).json({ error: 'Failed to load floors' });
        });

});

module.exports = router;
