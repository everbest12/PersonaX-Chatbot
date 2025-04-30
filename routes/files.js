const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Initialize OpenAI with error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
  // Don't throw here, let the server start and handle API calls gracefully
}

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = {
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype,
      name: req.file.originalname
    };

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process file content
router.post('/process', auth, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ message: 'OpenAI service is not available' });
    }

    const { fileUrl, fileType } = req.body;

    if (!fileUrl || !fileType) {
      return res.status(400).json({ message: 'Missing file information' });
    }

    const filePath = path.join(__dirname, '..', fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    let content = '';
    
    if (fileType === 'application/pdf') {
      // Process PDF file
      // You would need to add a PDF processing library here
      content = 'PDF content processing not implemented';
    } else if (fileType === 'text/plain') {
      // Process text file
      content = fs.readFileSync(filePath, 'utf8');
    } else if (fileType.startsWith('video/')) {
      // Process video file
      // You would need to add video processing capabilities here
      content = 'Video processing not implemented';
    } else if (fileType.startsWith('audio/')) {
      // Process audio file
      // You would need to add audio processing capabilities here
      content = 'Audio processing not implemented';
    }

    // Use OpenAI to analyze the content
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes file content. Provide a summary and key insights from the content."
        },
        {
          role: "user",
          content: `Please analyze this content: ${content}`
        }
      ]
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      content,
      analysis
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      message: 'Error processing file',
      error: error.message 
    });
  }
});

// Delete file
router.delete('/:filename', auth, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 