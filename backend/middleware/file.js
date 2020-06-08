const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mimetype!");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const ext = MIME_TYPE_MAP[file.mimetype];
    let name =
      file.originalname.toLowerCase().replace(".", "") +
      "|" +
      Date.now() +
      "." +
      ext;
    name = name.replace(/^\s+|\s+$/g, "");
    cb(null, name);
  },
});

module.exports = multer({ storage: storage }).single("image");
