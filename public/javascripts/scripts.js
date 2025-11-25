/*
$(document).ready(function() {
	$( "#widget" ).load('views/wg_temp.ejs' );
});

$(document).ready(function() {
	alert('Welcome to StarTrackr! Now no longer under polic	investigation!');
});
 */

/**Aduc widget-ul de temperatura si pe urma fac refresh la temperatura la fiecare 5 sec **/
function getWgTemp(){
	$.post( "http://192.168.0.109:3000/wg_Temp", function( dataWG ) {
		$( "#widget" ).html( dataWG);

			var tempInterval = setInterval(function(){

				$.post( "http://192.168.0.109:3000/Temp", function( data ) {
					if(document.getElementById('wg_temp') !== null){
						var ResTemp = jQuery.parseJSON(data);
						$("#varTemp" ).html( ResTemp.TEMP);
					}else{
						//alert('Am schimbat content-ul');
						clearInterval(tempInterval);
					}
				}); //End Post din Interval

			}, 5000) //End setInterval


	});


};

/** Aduc chartul pentru temperatura si il populez**/
function getAChart() {
	$.post("http://192.168.0.109:3000/AreaTempChart", function (dataChart) {
			$("#chart").html(dataChart);
			if (document.getElementById('wg_chart') !== null) {
				$.post( "http://192.168.0.109:3000/getChartData", function( dataTmp ) {
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
	$.post( "http://192.168.0.109:3000/Senzori", function( data ) {
		$( "#widget" ).html( data);

	});
}

//---------------------------------------------------
function displayAlert(){
	alert("Hello! I am an alert box!!");
}

/**Fac refresh la temperatura la fiecare 5 sec **/
/*
function getLastTemp(){
	$.get( "http://localhost:3000/widget", function(dataWG) {
			$().html(dataWG);

			var tempInterval = setInterval(function () {

				$.post("http://localhost:3000/wg_temp", function (data) {
					if (document.getElementById('widget_wrapper') !== null) {
						var ResData = jQuery.parseJSON(data);
						$("#LivingTemp").html(ResData.TEMP);
					} else {
						//alert('Am schimbat content-ul');
						clearInterval(tempInterval);
					}
				}); //End Post din Interval

			}, 5000) //End setInterval

	});
};
*/
