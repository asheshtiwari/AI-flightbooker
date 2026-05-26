const assert = require('assert');
const { computeSurgeFare } = require('../services/pricingService');

try {
    console.log("Running tests for pricingService...");

    // Test normal fare (searches <= 3)
    const normalFare = computeSurgeFare(2000, 2);
    assert.strictEqual(normalFare, 2000, "Normal fare should not have surge applied");

    // Test surge fare (searches > 3)
    const surgeFare = computeSurgeFare(2000, 4); 
    assert.strictEqual(surgeFare, 2200, "Surge fare should increase by 10% for 1 extra search");

    // Test Enterprise Safety Guard (Max 50% Cap)
    const cappedFare = computeSurgeFare(2000, 20);
    assert.strictEqual(cappedFare, 3000, "Surge fare should never exceed 50% of the base fare (max cap)");

    console.log("All pricing tests passed successfully.");
} catch (error) {
    console.error(`Test failed: ${error.message}`);
    process.exit(1);
}