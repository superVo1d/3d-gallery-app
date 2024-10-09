const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3001;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with unique name
  },
});

const upload = multer({ storage });

// Route to upload a 3D model
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send({ message: 'File uploaded successfully', file: req.file });
});

// API Route to return the list of models
app.get('/models', (req, res) => {
  const modelsDirectory = path.join(__dirname, 'uploads/');

  // Read files from the uploads directory
  fs.readdir(modelsDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to read models directory' });
    }

    // Filter for 3D model file types
    const modelFiles = files.filter(file =>
      ['.obj', '.fbx', '.glb', '.gltf'].includes(path.extname(file))
    );

    // Send the list of model file names
    res.json({ models: modelFiles });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
