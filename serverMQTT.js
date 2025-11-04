var roomTemp = require('./models/RoomTemp_model.js');
var tempSensor = require('./models/TempSensor_model.js');

var mqtt = require('mqtt');
var server = mqtt.connect('mqtt://localhost', {
    cmd: 'connect'
    , protocolId: 'MQTT' // or 'MQIsdp' in MQTT 3.1.1
    , protocolVersion: 4 // or 3 in MQTT 3.1
    , clean: true // or false
    , clientId: 'Server'
    , keepalive: 0 // seconds, 0 is the default, can be any positive number
    , username: 'matteo'
    , password: new Buffer.from('collina') // passwords are buffers
    , will: {
        topic: 'Server/status'
        , payload: new Buffer.from('dead') // payloads are buffers
    }
});


// --- In-memory cache ---
const roomCache = {}; // { roomName: { setpoint, lastTemperature } }

// --- Load room setpoints into cache at startup ---
async function loadRoomCache() {
    const rooms = await tempSensor.loadSetPoint();
    rooms.forEach((r) => {
        roomCache[r.room] = { temp_setpoint: r.temp_setpoint, lastTemperature: null };
    });
    console.log("✅ Room cache loaded:", roomCache);
};

loadRoomCache();

server.on('connect', function(){
    server.subscribe('Temp/Cam1/Raspuns');
    server.subscribe('Temp/Cam2/Raspuns');
    server.subscribe('RoomTemp/Raspuns');
    server.subscribe('OnOff/Confirm');

    /**ASCULT MESAJELE**/
    /****************START************************/
    server.on('message', async function(topic, message, payload) {
            try {
                //Verific topic-ul
                switch (topic) {
                    case "RoomTemp/Raspuns" :
                        console.log('Am primit raspunsul din call-ul de Crone : %s',message);
                        var response = JSON.parse(message);
                        var room = response.ESP;
                        var temperatura = response.TEMP;
                        var umiditatea = response.HUM;
                        //var Data = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        // var DataTMP = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var DataTMP = new Date();
                        DataTMP.setHours( DataTMP.getHours() + 2 );
                        DataTMP = DataTMP.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var Data = new Date();
                        var An    =  Data.getFullYear();
                        var Luna  =  Data.getMonth()+1;
                        var Ziua  =  Data.getDate();
                        var Ora   = Data.getHours();
                        var Minut = Data.getMinutes();
                        /*
                         console.log('ID : %s',tempID);
                         console.log('Temp : %s',temperatura);
                         console.log('Umid : %s',umiditatea);
                         console.log('DataTMP : %s',DataTMP);
                         console.log('Data : %s',Data);
                         console.log('An : %s',An);
                         console.log('Luna : %s',Luna);
                         console.log('Ziua : %s',Ziua);
                         console.log('Ora : %s',Ora);
                         console.log('Minut : %s',Minut);
                         */
                        //--- Save to Database ---
                        roomTemp.addTemp(room, temperatura, umiditatea, DataTMP, An, Luna, Ziua, Ora, Minut, function(err, Temp){
                            if (err) console.log(err);
                        });


                        if (!roomCache[room]) {
                            console.warn(`⚠️ No cache entry for ${room}, using default setpoint 22°C`);
                            roomCache[room] = { temp_setpoint: 22, lastTemperature: temperatura };
                        }

                        // --- Update cache ---
                        roomCache[room] = roomCache[room] || {};
                        roomCache[room].lastTemperature = temperatura;
                        console.log(`Cache for ${room}:`, JSON.stringify(roomCache[room], null, 2));

                        // --- Compare and trigger TempOff if needed ---
                        if (temperatura > roomCache[room].temp_setpoint) {
                            const topicOff = `RoomTemp/TempOff/${room}`;
                            console.log( `${room}: ${temperatura}°C > ${roomCache[room].temp_setpoint}°C → sending ${topicOff}`);
                            server.publish(${topicOff}, 'OFF');
                        }

                        break;
                    default:
                        console.log("Server a primit mesaj pe topic necunoscut");
                }
            } catch (err) {
                console.error("Error handling MQTT message:", err);
            }

    });

    /****************END************************/

    }
);


/**DEFINIRE FUNCTII**/

/**1- Citesc si salvez temperatura din toate camerele**/
function SaveRoomTemp(){
    server.publish('RoomTemp/Cerere', 'GET');
    console.log('Serverul a trimis request de temperatura');
}

function LedOn(){
    server.publish('LED', 'ON');
    console.log('Am aprins LED');
}

function LedOff(){
    server.publish('LED', 'OFF');
    console.log('Am publigat OFF');

}

function GetTemp(camId){
    server.publish('Temp/Cam'+camId+'/Cerere', 'GET');
    console.log('Serverul a trimis request pentru CAM2');
    return new Promise(function(resolve, reject ){

        server.once('message',function(topic, message, payload) {
            //Verific topic-ul
            switch (topic) {
                case "Temp/Cam"+camId+"/Raspuns" :
                    var response;
                    response = message.toString();
                    resolve(response);
                    break;
                default:
                    reject("No message");

            }
        }) ;
    });

    console.log('Am trimis request de temperatura');
}

module.exports.ON = LedOn;
module.exports.OFF = LedOff;
module.exports.GetTemp = GetTemp;
module.exports.SaveRoomTemp = SaveRoomTemp;




