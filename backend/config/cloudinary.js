const dotenv = require('dotenv');
dotenv.config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'artisan-marketplace',
    resource_type: 'auto', // Allow any image type automatically
    // allowed_formats: ['jpg', 'png', 'jpeg'], // <--- DISABLE THIS LINE FOR NOW
  },
});

const upload = multer({ storage });

module.exports = { upload };