const mqtt4 = require('mqtt') ;
var ESP4  = mqtt4.connect('mqtt://localhost');



ESP4.on('connect',function(){
        Temp = Math.ceil(Math.random()*100)
        ESP4.publish('RoomTemp/Raspuns', '{"ESP" : "Test", "TEMP" :'+Temp+'}');
        console.log('Test a publicat temp');
    }
);
