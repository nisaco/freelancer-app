const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
  // Set the API Key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM, // Must be the verified sender in SendGrid
    subject: options.subject,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('SendGrid Error:', error);
    
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = sendEmail;