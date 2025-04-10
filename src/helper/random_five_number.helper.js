const randomFiveNumber = (prefix) => {
  let min = 10000;
  let max = 99999;
  let number = Math.floor(Math.random() * (max - min + 1)) + min;
  return prefix + number;
};

module.exports = randomFiveNumber;
