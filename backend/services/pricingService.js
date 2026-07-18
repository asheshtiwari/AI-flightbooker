// one place for all surge pricing logic

const computeSurgeFare = (baseFare, bookingCount) => {
    if (bookingCount < 3) {
        return baseFare;
    }

    // every 3 bookings adds 10%, max 50%
    const surgeMultiplier = Math.min(
        1 + (Math.floor(bookingCount / 3) * 0.10),
        1.50
    );

    return Math.round(baseFare * surgeMultiplier);
};

module.exports = { computeSurgeFare };