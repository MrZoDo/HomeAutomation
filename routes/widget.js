/**
 * Created by Mr.Zodo on 13.02.2019.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('am primit get pe widget');
    
    // Get the roomCache from serverMQTT module
    var serverMQTT = require('../serverMQTT');
    
    // Pass the roomCache to the template
    res.render('widgets/wg_temp', { roomCache: serverMQTT.roomCache });
});
module.exports = router;