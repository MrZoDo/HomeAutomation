const handlers = require('./MQTT/mqttHandlers');
const serverMQTT = require('./MQTT/serverMQTT'); // To check if we can access the cache export

// Mock request/response for API test
const mockRes = {
    json: function (data) {
        console.log("✅ API Response:", JSON.stringify(data, null, 2));
        if (data['Living'] && data['Living'].sensor_status) {
            console.log("✅ PASS: API returns room cache with status");
        } else {
            console.error("❌ FAIL: API did not return expected cache structure");
        }
    },
    status: function (code) {
        console.log("API Status:", code);
        return this;
    }
};

const mockReq = {};

// Mock roomCache for handlers test
const mockRoomCache = {
    'Living': {
        sensor_status: 'Offline'
    }
};


async function runTest() {
    console.log("🧪 Starting verification test...");

    // --- Test 1: Handlers (Regression Test) ---
    console.log("\n--- Test Case 1: Received 'Online' status ---");
    const topic1 = 'RoomStatus/Living';
    const message1 = 'Online';
    await handlers.handleRoomStatusUpdate(topic1, message1, mockRoomCache);

    if (mockRoomCache['Living'].sensor_status === 'Online') {
        console.log("✅ PASS: Room status updated to Online");
    } else {
        console.error(`❌ FAIL: Expected Online, got ${mockRoomCache['Living'].sensor_status}`);
    }

    // --- Test 2: API Endpoint Logic ---
    console.log("\n--- Test Case 2: API Endpoint Logic ---");
    // Simulate what the API route does
    try {
        // We can't easily import the route file without Express, so we test the logic:
        // accessing serverMQTT.roomCache
        if (serverMQTT.roomCache) {
            console.log("✅ PASS: serverMQTT.roomCache is accessible");
            // Simulate route handler
            mockRes.json(serverMQTT.roomCache);
        } else {
            console.error("❌ FAIL: serverMQTT.roomCache is undefined");
        }
    } catch (err) {
        console.error("❌ FAIL: Error accessing serverMQTT:", err);
    }

}

runTest();
