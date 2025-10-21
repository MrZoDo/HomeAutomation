//$( document ).ready(function() {
//	//$( "#widget" ).load('views/widgets/wg_temp.ejs' );
//});

/**Aduc widget-ul de temperatura si pe urma fac refresh la temperatura la fiecare 5 sec **/
function getWgTemp() {
	$.get("http://localhost:3000/wg_temp")
		.done(function(dataWG) {
			console.log("WgTemp call succeeded");
			$("#widget").html(dataWG);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.error("Error loading widget:", textStatus, errorThrown);
			console.log("Response text:", jqXHR.responseText);
		})
		.always(function() {
			console.log("getWgTemp() completed");
		});
}


//
//function getWgTemp(){
//	alert('getWgTemp function triggered');
//	$.get( "http://localhost:3000/widget", function( dataWG ) {
//		alert('1');
//		console.log("received");
//		$( "#widget" ).html( dataWG );
//		alert('WgTemp call made');
//			//var tempInterval = setInterval(function(){
//            //
//			//	$.get( "http://localhost:3000/temp", function( data ) {
//			//		if(document.getElementById('wg_temp') !== null){
//			//			var ResTemp = jQuery.parseJSON(data);
//			//			$("#varTemp" ).html( ResTemp.TEMP);
//			//		}else{
//			//			//alert('Am schimbat content-ul');
//			//			clearInterval(tempInterval);
//			//		}
//			//	}); //End Post din Interval
//            //
//			//}, 5000) //End setInterval
//
//
//	});
//
//
//};

function addSensorType() {
	$.get("http://localhost:3000/frm_sensorType")
		.done(function(dataFRM) {
			$("#widget").html(dataFRM);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.error("Error loading widget:", textStatus, errorThrown);
			console.log("Response text:", jqXHR.responseText);
		})
		.always(function() {
			console.log("addSensorType() completed");
		});
}


/** Aduc chartul pentru temperatura si il populez**/
function getAChart() {
	$.post("http://192.168.1.102:3000/AreaTempChart", function (dataChart) {
			$("#chart").html(dataChart);
			if (document.getElementById('wg_chart') !== null) {
				$.post( "http://192.168.1.102:3000/getChartData", function( dataTmp ) {
					return(arr = dataTmp);
				});
				dataArr = arr;
				Morris.Area({
					element: 'morris-area-chart',
					data: dataArr,
					xkey: 'Data',
					ykeys: ['temperatura'],
					labels: ['CAM1'],
					pointSize: 2,
					hideHover: 'auto',
					resize: true
				});
			}

		}
	)

}

function getSenzori(){
	$.post( "http://localhost:3000/Senzori", function( data ) {
		$( "#widget" ).html( data);
	});
}

function crescTemp(){
	$.post("http://localhost:3000/crescTemp", function (dataCT) {
		$("#widget").html(dataCT);
	});
}

function scadTemp(){
	$.post("http://localhost:3000/scadTemp", function (dataCT) {
		$("#widget").html(dataCT);
	});
}

<<<<<<< HEAD
function openSettings(){
	$("#widget").load("./page-content/settings.html");
}
=======
>>>>>>> test
