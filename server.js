const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://meme-frontend.onrender.com',
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10mb' })); 

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Store IP logs
let ipLogs = [];

// Route to handle image uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    url: `https://meme-backend-d2kh.onrender.com/uploads/${req.file.filename}`
  });
});

// Route to fetch stored images
app.get('/photos', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read directory' });
    }

    const photos = files.map(file => ({
      url: `https://meme-backend-d2kh.onrender.com/uploads/${file}`,
      timestamp: new Date(parseInt(file.split('.')[0])).toLocaleString()
    }));

    res.json(photos);
  });
});

// Route to log IPs
app.post('/logIP', (req, res) => {
  if (!req.body.ip) {
    return res.status(400).json({ message: 'No IP provided' });
  }

  const ipLog = { ip: req.body.ip, timestamp: new Date().toLocaleString() };
  ipLogs.push(ipLog);
  res.json({ message: 'IP logged successfully' });
});

// Route to fetch IP logs
app.get('/ips', (req, res) => {
  res.json(ipLogs);
});

// Serve static files (images)
app.use('/uploads', express.static(uploadsDir));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
