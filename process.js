const processImage = (req, res) => {
  console.log(req.file)
  const pythonProcess = spawn('python', ['processImage.py', req.file.path]);
  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  pythonProcess.on('close', (code) => {
    console.log(`Python script process exited with code ${code}`);
  });
  res.status(200).json({ filename: req.file.filename });
} 
export default processImage;