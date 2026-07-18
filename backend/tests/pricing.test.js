const assert = require('assert');
const { computeSurgeFare } = require('../services/pricingService');

try {
    console.log("running pricing tests...");

    // no surge below 3 bookings
    const normalFare = computeSurgeFare(2000, 2);
    assert.strictEqual(normalFare, 2000, "fare should stay same under 3 bookings");

    // 3 bookings = first surge kick in, 10% up
    const surgeFare = computeSurgeFare(2000, 3);
    assert.strictEqual(surgeFare, 2200, "fare should go up 10% at 3 bookings");

    // way too many bookings, cap at 50%
    const cappedFare = computeSurgeFare(2000, 30);
    assert.strictEqual(cappedFare, 3000, "fare should never go above 50% of base");

    console.log("all tests passed.");

} catch (error) {
    console.error(`test failed: ${error.message}`);
    process.exit(1);
}