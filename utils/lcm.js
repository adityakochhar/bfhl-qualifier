const { getGCD } = require('./hcf');

const getLCM = (a, b) => (a * b) / getGCD(a, b);

module.exports = { getLCM };

