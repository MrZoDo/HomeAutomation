/**
 * Created by Mr.Zodo on 13.02.2019.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('am primit get pe widget');
    //const widgetData = {
    //    TEMP: '22°C',
    //    // Add other data as needed
    //};
    //
    //// Render the wg_temp.ejs template and send it as the response
    //res.render('widgets/wg_temp', widgetData);
    //res.render('wg_temp_1',{Temperatura: '25'});
    //res.render('wg_temp_1');
    res.render('widgets/wg_temp',{ReadTempESP1: '10', ReadTempESP2: '20'});
});
module.exports = router;