// formats number to Indian rupee string eg 3500 -> ₹3,500
export const formatIndianRupees = (amount) => {
    // null or undefined aaye to zero dikhao
    if (amount === null || amount === undefined) {
        return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};