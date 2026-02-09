const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
// Load env vars
dotenv.config();

// Initialize App
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Connect to Database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// --- API ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/artisan', require('./routes/artisanRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes')); // Matches your file name
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// =================================================================
//  THE GLUE CODE (Production Mode)
// =================================================================

if (process.env.NODE_ENV === 'production') {
  // 1. Point to the dist folder
  const buildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(buildPath));

  // 2. The Catch-All Route: This handles React Router refreshes
 app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
});
} else {
  app.get('/', (req, res) => res.send('API is running in Development Mode...'));
}

// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));