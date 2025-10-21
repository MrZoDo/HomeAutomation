"use strict";
var cron = require('node-cron');

var server = require('./server');


/** Ruleaza la fiecare minut **/
//var recordTemp = cron.schedule('* * * * *', function() {
//    saveTempToDb();
//});

//module.exports.saveTemp = recordTemp ;

/**
 * Trimit request de citire
 * Temperaturile citite sunt preluate de catre server.js si salvate
 **/
function saveTempToDb() {
    console.log('Call din Cron');
    server.SaveRoomTemp();
}