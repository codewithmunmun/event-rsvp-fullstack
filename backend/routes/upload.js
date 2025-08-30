const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Cloudinary configuration for production
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS for production
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'uploads/events';
    let public_id_prefix = 'event';

    if (req.originalUrl.includes('profile-picture')) {
      folder = 'uploads/profile-pictures';
      public_id_prefix = 'profile';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      public_id: `${public_id_prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload event image
router.post('/event-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path, // Cloudinary URL
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload profile picture (with delete old one)
router.post('/profile-picture', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newImageUrl = req.file.path; // Cloudinary URL
    const newPublicId = req.file.filename;

    // Get old profile picture URL from DB
    const result = await db.query(
      'SELECT profile_picture FROM users WHERE id = $1',
      [req.userId]
    );
    const oldImageUrl = result.rows[0]?.profile_picture;

    // If old image exists, extract its Cloudinary public_id and delete it
    if (oldImageUrl) {
      const oldPublicId = oldImageUrl.split('/').slice(-1)[0].split('.')[0]; // extract filename without extension
      await cloudinary.uploader.destroy(`uploads/profile-pictures/${oldPublicId}`);
    }

    // Update user profile with new image
    await db.query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [newImageUrl, req.userId]
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      imageUrl: newImageUrl,
      publicId: newPublicId
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }

  console.error('Upload error:', error);
  res.status(500).json({ message: 'Upload failed' });
});

// Test upload endpoint
router.post('/test', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename
  });
});

module.exports = router;
