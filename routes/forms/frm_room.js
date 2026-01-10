/**
 * Created by Zodo on 10/23/2025.
 */
var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    console.log('Route: S-a primit call pentru form-ul de Room');
    
    try {
        var rm = require('../../models/Room_model.js');
        var fm = require('../../models/Floor_model.js');

        const rooms_res = await rm.loadRooms();
        console.log('Route: Room Model Response->Room list:', rooms_res);

        const floors_res = await fm.loadFloors();
        console.log('Route: Floor Model Response->Floor list:', floors_res);

        res.render('forms/frm_room', { rooms: rooms_res, floors: floors_res });
    } catch (err) {
        console.error('Error loading data:', err);
        res.status(500).json({ error: 'Failed to load rooms' });
    }
});

module.exports = router;