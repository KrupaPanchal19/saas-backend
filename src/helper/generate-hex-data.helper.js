const genRanHex = (size = 32) => {
  const token = [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  return token;
};

module.exports = { genRanHex };
