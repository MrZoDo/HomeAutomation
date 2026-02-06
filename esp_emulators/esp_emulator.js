const mqtt1 = require('mqtt');

// Setup LWT for this client
var ESP = mqtt1.connect('mqtt://localhost', {
    will: {
        topic: 'RoomStatus/Living',
        payload: 'Offline',
        qos: 1,
        retain: true
    }
});

ESP.on('connect', function () {
    console.log("✅ Emulator Connected to MQTT");

    ESP.subscribe('LED');
    ESP.subscribe('Temp/Cam1/Cerere');
    ESP.subscribe('Temp/Cam2/Cerere');
    ESP.subscribe('RoomTemp/Cerere');

    // Publish "Online" status with Retain flag
    console.log("📤 Sending Retained 'Online' status to RoomStatus/Living");
    ESP.publish('RoomStatus/Living', 'Online', { retain: true });

    ESP.on('message', function (topic, message, payload) {
        var top;
        top = topic.toString();

        var mes;
        mes = message.toString();

        console.log('Am primit cerere pe topic ' + top);
        switch (top) {
            case "Temp/Cam1/Cerere":
                Temp = Math.ceil(Math.random() * 100)
                ESP.publish('Temp/Cam1/Raspuns', '{"ESP" : "CAM1", "TEMP" :' + Temp + '}');
                console.log('Cam1 a publicat temp');
                break;
            case "Temp/Cam2/Cerere":
                Temp = Math.ceil(Math.random() * 100)
                ESP.publish('Temp/Cam2/Raspuns', '{"ESP" : "CAM2", "TEMP" :' + Temp + '}');
                console.log('Cam2 a publicat temp');
                break;
            case "RoomTemp/Cerere":
                Temp = Math.ceil(Math.random() * 100)
                ESP.publish('RoomTemp/Raspuns', '{"ESP" : "Living", "TEMP" :' + Temp + '}');
                console.log('Living a publicat temp');
                break;
            case "LED":
                switch (mes) {
                    case "ON":
                        console.log('Am primit mesajul ON');
                        break;
                    case "OFF":
                        console.log('Am primit mesajul OFF');
                        break;
                }

        }
    })
}
);
