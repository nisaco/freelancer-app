const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 1. Load env vars
dotenv.config();

// 2. Import Routes
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ONLY ONCE HERE
const authRoutes = require('./routes/authRoutes');

// 3. Initialize App
const app = express();

// 4. Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// 5. Connect to Database
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

// 6. Health Check
app.get('/api/ping', (req, res) => {
  res.json({ message: "API is alive and listening", time: new Date() });
});

// 7. --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes); // ONLY ONCE HERE
app.use('/api/payment', paymentRoutes);

// For routes where you haven't assigned a variable above:
app.use('/api/artisan', require('./routes/artisanRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 8. --- THE GLUE CODE (Production Mode) ---
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(buildPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('API is running in Development Mode...'));
}

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));