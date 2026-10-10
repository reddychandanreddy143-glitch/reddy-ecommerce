const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'C:/BCA/REDDY E-COMMERCE/apps/api/.env' });

console.log('Testing SMTP connection with:');
console.log('Host:', process.env.MAIL_HOST);
console.log('User:', process.env.MAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP Verify Error:', err.message);
  } else {
    console.log('SMTP Server is ready to take messages!');
  }
});