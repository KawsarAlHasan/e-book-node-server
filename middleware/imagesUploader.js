const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/images",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix + "_" + sanitizedFilename);
  },
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg/;
    const extension = path.extname(file.originalname);

    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Must be png/jpg/jpeg image"));
    }
  },
  limits: {
    fileSize: 10097152, // Less than 2 MB (2 * 1024 * 1024)
  },
});

module.exports = uploadImage;
