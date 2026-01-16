const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // <--- REQUIRED FOR THE GLUE
const paymentRoutes = require('./routes/paymentRoutes');
// Load env vars
dotenv.config();

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));



// =================================================================
//  THE GLUE CODE (Production Mode)
// =================================================================

if (process.env.NODE_ENV === 'production') {
  
  // 1. Serve static assets (CSS, Images, JS)
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // 2. The Catch-All Route (Using 'use' instead of 'get' to bypass parser errors)
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });

} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

// -----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));