const express = require('express');
const router = express.Router();
// Import loginUser here
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser); // <--- Add this line

module.exports = router;