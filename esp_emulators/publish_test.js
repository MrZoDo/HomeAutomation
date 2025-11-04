const mqtt4 = require('mqtt') ;
var ESP4  = mqtt4.connect('mqtt://localhost');



ESP4.on('connect',function(){
        Temp1 = Math.ceil(Math.random()*100);
        Temp2 = Math.ceil(Math.random()*100)
        ESP4.publish('RoomTemp/Raspuns', '{"ESP" : "Living", "TEMP" :'+Temp1+'}');
        ESP4.publish('RoomTemp/Raspuns', '{"ESP" : "Baie", "TEMP" :'+Temp2+'}');
        console.log('Test a publicat temp');
    }
);
