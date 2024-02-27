import express from 'express'
import multer from 'multer'
import path from 'path'
import processImage from './process';

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, 
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image'); 

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|heic/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only (jpeg, jpg, png, heic)');
  }
}

app.use('/uploads', express.static('uploads'));

app.post('/upload', 
  (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err });
      } else if (!req.file) {
        res.status(400).json({ error: 'No file selected' });
      }
    });
  },
  processImage
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
