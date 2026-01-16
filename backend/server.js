const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware (The Gatekeepers)
app.use(express.json()); // Allows app to accept JSON data in body
app.use(cors()); // Allows your React frontend to connect

// Routes (We will create this file in the next step, but we link it here now)
 app.use('/api/auth', require('./routes/authRoutes')); 

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/artisan', require('./routes/artisanRoutes.js'));

app.use('/api/upload', require('./routes/uploadRoutes'));

app.use('/api/jobs', require('./routes/jobRoutes'));

app.use('/api/reviews', require('./routes/reviewRoutes'));

// --- ADD THIS SAFETY NET ---
app.use((err, req, res, next) => {
  console.error("🔥 CRITICAL ERROR:", err.message); // This prints the real reason
  console.error(err.stack); // This prints where it happened
  res.status(500).json({ 
    message: err.message, 
    error: err 
  });
});
// ---------------------------


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});