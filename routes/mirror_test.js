/**
 * Created by Mr.Zodo on 27.01.2019.
 */
var express = require('express');
var router = express.Router();
var temp = require('../models/RoomTemp_model.js');

/*
 router.get('/', function(req, res, next) {
 temp.getLastData().then(function(lastData){
 temp.getLastDbTemp({ tempID: { $in: [ "Hol", "Living" ] } }).then(function(data){
 console.log(data);
 res.send(data);
 }).catch(function(err){
 //handle error
 console.log('Eroare la trimitere temperatura widget: route wg_temp')
 }) ;
 }
 );
 });
 */
router.get('/', function(req, res, next) {
    console.log('am primit get pe mirror_test');
    temp.getLastData().then(function(lData){
            var lastData = lData[0].Data;
            temp.getDbTemp({Data: lastData}).then(function(data){
                console.log('Return din db:',data);
                res.send(data);
            }).catch(function(err){
                //handle error
                console.log('Eroare la trimitere temperatura widget: route mirror')
            }) ;
        }
    );
});
module.exports = router;

