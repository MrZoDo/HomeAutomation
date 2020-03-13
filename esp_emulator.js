const mqtt1 = require('mqtt') ;
var ESP  = mqtt1.connect('mqtt://localhost');

ESP.on('connect',function(){
        ESP.subscribe('LED') ;
        ESP.subscribe('Temp/Cam1/Cerere') ;
        ESP.subscribe('Temp/Cam2/Cerere') ;
        ESP.subscribe('RoomTemp/Cerere') ;

        ESP.on('message',function(topic, message, payload){
            var top;
            top = topic.toString();

            var mes;
            mes = message.toString();

            console.log('Am primit cerere pe topic ' + top);
            switch(top) {
                case "Temp/Cam1/Cerere" :
                    Temp = Math.ceil(Math.random()*100)
                    ESP.publish('Temp/Cam1/Raspuns', '{"ESP" : "CAM1", "TEMP" :'+Temp+'}');
                    console.log('Cam1 a publicat temp');
                    break;
                case "Temp/Cam2/Cerere" :
                    Temp = Math.ceil(Math.random()*100)
                    ESP.publish('Temp/Cam2/Raspuns', '{"ESP" : "CAM2", "TEMP" :'+Temp+'}');
                    console.log('Cam2 a publicat temp');
                    break;
                case "RoomTemp/Cerere" :
                    Temp = Math.ceil(Math.random()*100)
                    ESP.publish('RoomTemp/Raspuns', '{"ESP" : "Living", "TEMP" :'+Temp+'}');
                    console.log('Living a publicat temp');
                    break;
                case "LED" :
                    switch(mes){
                        case "ON" :
                            console.log('Am primit mesajul ON');
                            break;
                        case "OFF" :
                            console.log('Am primit mesajul OFF');
                            break;
                    }

            }
        })
    }
);
