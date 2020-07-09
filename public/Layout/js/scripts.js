$( document ).ready(function() {
	$( "#widget" ).load('views/wg_temp.ejs' );
});

/**Aduc widget-ul de temperatura si pe urma fac refresh la temperatura la fiecare 5 sec **/
function getWgTemp(){
	$.post( "http://localhost:3000/Wg_Temp", function( dataWG ) {
		$( "#widget" ).html( dataWG);

			var tempInterval = setInterval(function(){

				$.post( "http://localhost:3000/Temp", function( data ) {
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