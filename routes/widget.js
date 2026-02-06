/**
 * Created by Mr.Zodo on 13.02.2019.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    console.log('[WIDGET router]: am primit get pe widget');

    // Get the roomCache from serverMQTT module
    var serverMQTT = require('../MQTT/serverMQTT');

    // Pass the roomCache to the template
    if (!serverMQTT.roomCache || Object.keys(serverMQTT.roomCache).length === 0) {
        console.warn('[WIDGET router]: roomCache is empty or undefined');
    }
    console.log('[WIDGET router]: roomCache contents:', serverMQTT.roomCache);
    
    res.render('Widgets/wg_temp', { roomCache: serverMQTT.roomCache });
});
module.exports = router;