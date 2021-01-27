//========================================
//Utility Functions
//========================================
const wholeNumAvg = arrayOfNumbers => {
  const integers = arrayOfNumbers.map(num => parseInt(num));
  const average = integers.reduce((a, b) => a + b, 0) / integers.length;
  const AvgWholeNum = Math.round(average);
  return AvgWholeNum;
};

const convertNumber = abbrevNum => {
  if (abbrevNum[abbrevNum.length - 1] === 'M') {
    const numNoLabel = abbrevNum.replace('M', '');
    return numNoLabel * 1000000;
  } else if (abbrevNum[abbrevNum.length - 1] === 'K') {
    const numNoLabel = abbrevNum.replace('K', '');
    return numNoLabel * 1000;
  } else if (parseInt(abbrevNum[abbrevNum.length - 1]) != NaN) {
    return parseInt(abbrevNum);
  }
};

module.exports = {
  wholeNumAvg,
  convertNumber
};
