const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const cors = require("cors"); // Import CORS middleware

const app = express();
const port = 3001;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:4200", // Change to the port your Angular app is running on
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};

app.use(cors(corsOptions)); // Enable CORS for all routes

// Storage for uploaded files
const uploadFolder = "./uploads";
fs.ensureDirSync(uploadFolder);

// JSON file to store metadata
const modelsFilePath = "./models.json";
fs.ensureFileSync(modelsFilePath);

// Load or create the models JSON file
let models = [];
if (fs.existsSync(modelsFilePath)) {
  models = fs.readJsonSync(modelsFilePath, { throws: false }) || [];
}

// Multer configuration for file upload
const upload = multer({
  dest: uploadFolder,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /glb|gltf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Only .glb or .gltf files are allowed!"));
  },
});

// POST /api/upload to upload a file and save metadata
app.post("/api/upload", upload.single("model"), (req, res) => {
  const { name, author } = req.body;

  if (!name || !author || !req.file) {
    return res
      .status(400)
      .send({ error: "Missing required fields: name, author, or file." });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const modelData = {
    name,
    author,
    modelUrl: fileUrl,
  };

  models.push(modelData);
  fs.writeJsonSync(modelsFilePath, models);

  res.status(200).send({
    message: "File uploaded and metadata saved successfully.",
    modelData,
  });
});

// GET /api/items to retrieve the list of all models
app.get("/api/items", (req, res) => {
  res.status(200).send(models);
});

// Serve uploaded files statically
app.use("/uploads", express.static(uploadFolder));

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
