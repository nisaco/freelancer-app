const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { initSocket } = require('./socket');

// Load env vars
dotenv.config();

// Initialize App
const app = express();

// Import Route Files
const authRoutes = require('./routes/authRoutes');
const artisanRoutes = require('./routes/artisanRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const jobRoutes = require('./routes/jobRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const disputeRoutes = require('./routes/disputeRoutes');

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

// Health Check
app.get('/api/ping', (req, res) => {
  res.json({ message: "API is alive and listening", time: new Date() });
});

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/artisan', artisanRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/disputes', disputeRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =================================================================
//  THE GLUE CODE (Production Mode)
// =================================================================
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(buildPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('API is running in Development Mode...'));
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
