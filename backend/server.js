const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // <--- REQUIRED FOR THE GLUE

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


// --- TEMPORARY DEBUG ROUTE ---
app.get('/debug-email', async (req, res) => {
  const sendEmail = require('./utils/sendEmail');
  try {
    console.log("Debug Route: Attempting to send...");
    console.log("Using User:", process.env.BREVO_USER); // Log the USER (safe to see)
    // DO NOT LOG THE PASSWORD

    await sendEmail({
      to: 'YOUR_PERSONAL_EMAIL@gmail.com', // <--- HARDCODE YOUR REAL EMAIL HERE
      subject: 'Debug Test from Live Server',
      html: '<h1>If you see this, the server is working!</h1>'
    });
    res.send('Email sent! Check logs for details.');
  } catch (error) {
    console.error("Debug Route Failed:", error);
    res.status(500).send('Failed: ' + error.message);
  }
});
// -----------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));