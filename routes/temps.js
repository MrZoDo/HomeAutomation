/**
 * Created by Mr.Zodo on 21.11.2018.
 */
var express = require('express');
var router = express.Router();

var server = require('../serverMQTT');


/* GET Temps */
router.get('/', function(req, res, next) {
    //res.send('TMP');
    console.log('primit call in route');
    serverMQTT.GetTemp(2).then(
        function(succesMessage){
            console.log('Am primit raspunsul din call-ul de Web : %s',succesMessage);
            X = JSON.parse(succesMessage);
            TMP = X.TEMP;
            console.log(TMP);
           //res.sendStatus(200);
           // res.writeHead(200, {'Content-Type': 'text/plain'});
           // res.X.TEMP;
            res.send('TMP');
        }).catch(
        function(e){
            console.log(e);
            res.sendStatus('a');
        });

});

module.exports = router;
