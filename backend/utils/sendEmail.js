const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create the Transporter (Connect to Brevo)
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // This is Brevo's specific server
    port: 587,                     // Standard secure port
    secure: false,                 // False for port 587
    auth: {
      user: process.env.BREVO_USER, // Your Login Email for Brevo
      pass: process.env.BREVO_PASS, // Your API Key (xsmtpsib-...)
    },
  });

  // 2. Define the Email
  const mailOptions = {
    from: `"ArtisanConnect" <${process.env.EMAIL_FROM}>`, // Must be your verified sender
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Email Error:', error);
  }
};

module.exports = sendEmail;