const imageFilter = function (file) {
  if (!file.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    return false;
  } else {
    return true;
  }
};
module.exports = imageFilter;
