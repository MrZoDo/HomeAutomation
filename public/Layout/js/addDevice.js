$(document).ready(()=>{
    $("#add-device").on('click', ()=>{
        var deviceName = $("#add-device-input").val();
        if(deviceName.length !== 0) $("#device-list").append(`<li><a href="#">${deviceName}</a></li>`); 
    });
    
    $("#add-device").submit((event)=>{
        event.preventDefault();
        var deviceName = $("#add-device-input").val();
        if(deviceName.length !== 0) $("#device-list").append(`<li><a href="#">${deviceName}</a></li>`);
    });
});