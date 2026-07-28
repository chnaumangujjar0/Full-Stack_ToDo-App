import multer from "multer";
import path from "path";
import fs from "fs"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./public/temp";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})
export const upload = multer({ storage: storage })