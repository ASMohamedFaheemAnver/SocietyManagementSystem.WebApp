const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const imgDeleteHeader = req.get("Delete-Image");
  // console.log(imgDeleteHeader);
  if (!imgDeleteHeader) {
    req.isImg = false;
    return next();
  }

  const token = imgDeleteHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.secret_word);
  } catch (err) {
    req.isImg = false;
    return next();
  }

  if (!decodedToken) {
    req.isImg = false;
    return next();
  }
  req.imageUrl = decodedToken.imageUrl;
  req.isImg = true;
  next();
};
