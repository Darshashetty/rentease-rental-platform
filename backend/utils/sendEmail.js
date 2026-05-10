const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('[email] SMTP credentials missing; skipping real send and logging payload for local development.');
      console.log(`[email] to=${options.email}`);
      console.log(`[email] subject=${options.subject}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `RentEase Support <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] sent successfully messageId=${info.messageId} to=${options.email}`);
  } catch (error) {
    console.error(`[email] failed to send to=${options?.email}: ${error.message}`);
  }
};

module.exports = sendEmail;
