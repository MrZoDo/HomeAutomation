/**
 * Created by Zodo on 10/23/2025.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('Route:S-a primit call pentru form-ul de Room');
    var rm = require('../../models/Room_model.js');

    rm.loadRooms()
        .then(result => {
        // Handle success: result is the list with Rooms
            console.log('Route: Model Response->Room list:', result);
            res.render('forms/frm_room', { rooms: result });
        })
        .catch(err => {
        // Handle error (e.g., validation error, unique constraint violation)
            console.error('Error loading Rooms:', err);
            res.status(500).json({ error: 'Failed to load rooms' });
        });

});

module.exports = router;