const mqtt2 = require('mqtt') ;
var ESP2  = mqtt2.connect('mqtt://localhost');

ESP2.on('connect',function(){
        ESP2.subscribe('RoomTemp/Cerere') ;

        ESP2.on('message',function(topic, message, payload){
            var top;
            top = topic.toString();

            var mes;
            mes = message.toString();

            console.log('Am primit cerere pe topic ' + top);
            switch(top) {
                case "RoomTemp/Cerere" :
                    Temp = Math.ceil(Math.random()*100)
                    Hum = Math.ceil(Math.random()*100)
                    ESP2.publish('RoomTemp/Raspuns', '{"ESP" : "Hol", "TEMP" :'+Temp+', "HUM" :'+Hum+'}');
                    console.log('Hol a publicat temp');
                    break;
                default:
                    console.log("Hol a primit mesaj pe topic necunoscut");

            }
        })
    }
);
