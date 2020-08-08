/**
 * Created by Mr.Zodo on 13.02.2019.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('Am primit get pe widget');
    res.render('mirror',{});
});
module.exports = router;