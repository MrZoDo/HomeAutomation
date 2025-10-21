/**
 * Created by Zodo on 10/18/2025.
 */
// Example Usage (assuming you are in an Express route or similar context)
// This needs to be wrapped in an async function to use 'await'
//async function exampleUsage(res) {
//    try {
//        var st = require('./models/SensorType_model.js');
//        const result = await st.addSensorType('Test');
//        // Handle success: result is the saved document
//        console.log('Sensor Type saved successfully:', result);
//        // Note: 'res' would need to be passed in, assuming an Express context
//        // res.send({ success: true, data: result });
//    } catch (err) {
//        // Handle error (e.g., validation error, unique constraint violation)
//        console.error('Error saving Sensor Type:', err);
//        // res.status(500).send(err);
//    }
//}
//
//exampleUsage();


var st = require('./models/SensorType_model.js');
// Assuming a 'res' object is somehow available or passed in (e.g., in a route)
st.addSensorType('Test4')
    .then(result => {
// // Handle success: result is the saved document
    console.log('Sensor Type saved successfully (Promise style):', result);
// res.send({ success: true });
})
.catch(err => {
    // Handle specific errors, e.g., Mongoose unique constraint violation (Code 11000)
    // Handle error (e.g., validation error, unique constraint violation)
    console.error('Error saving Sensor Type (Promise style):', err);

// res.status(500).send(err);
});

//
//try {
//    var st = require('./models/SensorType_model.js');
//    // 2. Call your promise-returning function
//    const result = await st.addSensorType('asd');
//
//    // 3. Send a success response
//    // The success response triggers the `function() { location.reload(); }` on the client
//    res.json({ success: true, sensorType: result.sensor_type });
//
//} catch (err) {
//    console.error('Error saving sensor type:', err.message);
//
//    // Handle specific errors, e.g., Mongoose unique constraint violation (Code 11000)
//    if (err.code === 11000) {
//        return res.status(409).send('Sensor type already exists.');
//    }
//
//    // Send a generic error response
//    res.status(500).send('Failed to add sensor type.');
//}