const multer = require("multer");
const path = require("path");
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.set("server.timeout", 300000);
const PORT = 3001;
const { spawn } = require("child_process");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|heic/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only (jpeg, jpg, png, heic)");
  }
}

app.use("/uploads", express.static("uploads"));

app.post(
  "/upload",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err });
      } else if (!req.file) {
        res.status(400).json({ error: "No file selected" });
      } else {
        next();
      }
    });
  },
  async (req, res) => {
    try {
      // const fileFormData = new FormData();
      // const file = req.file;
      // const fileData = fs.readFileSync(file.path);
      // const fileBlob = new Blob([fileData], { type: file.mimetype });
      // fileFormData.append('file', fileBlob, { filename: file.originalname });
      // const pythonServerUrl = 'http://localhost:3003';
      // const response = await axios.post(pythonServerUrl, fileFormData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      // fs.writeFileSync('./after-images/' + file.filename, response.data);
      // const base64Image = Buffer.from(response.data).toString('base64');
      // Replace 'your_script.py' with the actual name of your Python script
      const pythonProcess = spawn("python3", ["processImage.py"]);
      pythonProcess.stdout.on("data", (data) => {
        console.log(`Python Script Output: ${data}`);
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Error from Python Script: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(`Python Script exited with code ${code}`);
      });
      res.send({
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.log("processing error", error);
      res.status(500).send("Error forwarding file");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
