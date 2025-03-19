const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

// Use SendGrid 
const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://coolestappever.xyz/api/verify_email?token=${token}`;

  console.log(verificationLink);

  const mailOptions = {
    to: email,
    from: 'clarity-notesapp@outlook.com',
    subject: 'Clarity - Email Verification',
    html: `<p>Please click the following link to verify your email:</p>
           <a href="${verificationLink}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };