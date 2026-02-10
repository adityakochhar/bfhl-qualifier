const getFibonacci = (n) => {
    if (n <= 0) return [];
    if (n === 1) return [0];
    let series = [0, 1];
    while (series.length < n) {
        series.push(series[series.length - 1] + series[series.length - 2]);
    }
    return series;
};

module.exports = { getFibonacci };

