const fs = require("fs");

const folderExistCheck = function (dir) {
  if (!fs.existsSync("./public")) {
    fs.mkdirSync("./public");
    fs.chmodSync("./public", 0777);
  }
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.chmodSync(`./${dir}`, 0777);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  } else {
    return true;
  }
};
module.exports = folderExistCheck;
