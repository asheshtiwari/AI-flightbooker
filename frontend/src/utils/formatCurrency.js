/**
 * Formats a number as Indian Rupees.
 * @param {number} amount
 */
export const formatIndianRupees = (amount) => {
    // Return default zero if value is missing
    if (amount === null || amount === undefined) {
        return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};