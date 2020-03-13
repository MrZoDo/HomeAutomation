/**
 * Created by Mr.Zodo on 14.02.2019.
 */

/**Aduc datele la prima accesare iar pe urma fac refresh la fiecare 10 sec **/
function getLastTemp(){
    //Aduc datele la prima accesare
    $.get("http://192.168.0.109:3000/mirror", function (data) {
        for (i in data) {
            x = data[i];
            //alert(x.tempID);
            switch(x.tempID) {
                case "Living" :
                    $("#LivingTemp").html(x.temperatura);
                    $("#LivingHum").html(x.umiditatea);
                    break;
                case "Hol" :
                    $("#HolTemp").html(x.temperatura);
                    $("#HolHum").html(x.umiditatea);
                    break;
                case "Cam_Fete" :
                    $("#FeteTemp").html(x.temperatura);
                    $("#FeteHum").html(x.umiditatea);
                    break;
            }
        };
        var tempInterval = setInterval(function(){
            $.get("http://192.168.0.109:3000/mirror", function (data) {
                for (i in data) {
                    x = data[i];
                    //alert(x.tempID);
                    switch(x.tempID) {
                        case "Living" :
                            $("#LivingTemp").html(x.temperatura);
                            $("#LivingHum").html(x.umiditatea);
                            break;
                        case "Hol" :
                            $("#HolTemp").html(x.temperatura);
                            $("#HolHum").html(x.umiditatea);
                            break;
                        case "Cam_Fete" :
                            $("#FeteTemp").html(x.temperatura);
                            $("#FeteHum").html(x.umiditatea);
                            break;
                    }
                }
            }); //End Get din Interval
        }, 40000); //End setInterval
    });

}
