/**
 * Calculate dynamic ticket price based on search frequency.
 * @param {number} baseFare
 * @param {number} searchCount
 * @returns {number}
 */
const computeSurgeFare = (baseFare, searchCount) => {
    let finalPrice = baseFare;

    // Apply 10% compounding surge for every search after 3
    if (searchCount > 3) {
        const extraSearches = searchCount - 3;
        finalPrice = baseFare * Math.pow(1.10, extraSearches);
        
        // Enterprise Safety Guard: Cap the maximum surge to 50% of the base fare
        const maxAllowedFare = baseFare * 1.50;
        if (finalPrice > maxAllowedFare) {
            finalPrice = maxAllowedFare;
        }
    }

    return Math.round(finalPrice);
};

module.exports = {
    computeSurgeFare
};