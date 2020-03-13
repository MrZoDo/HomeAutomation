const mqtt3 = require('mqtt') ;
var ESP3  = mqtt3.connect('mqtt://localhost');

ESP3.on('connect',function(){
        ESP3.subscribe('RoomTemp/Cerere') ;

        ESP3.on('message',function(topic, message, payload){
            var top;
            top = topic.toString();

            var mes;
            mes = message.toString();

            console.log('Am primit cerere pe topic ' + top);
            switch(top) {
                case "RoomTemp/Cerere" :
                    Temp = Math.ceil(Math.random()*100)
                    ESP3.publish('RoomTemp/Raspuns', '{"ESP" : "Living", "TEMP" :'+Temp+'}');
                    console.log('Living a publicat temp');
                    break;
                default:
                    console.log("Living a primit mesaj pe topic necunoscut");

            }
        })
    }
);
