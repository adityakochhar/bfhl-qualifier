const getGCD = (a, b) => (b === 0 ? a : getGCD(b, a % b));

module.exports = { getGCD };

