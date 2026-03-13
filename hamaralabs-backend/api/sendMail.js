
import nodemailer from 'nodemailer';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {return res.status(200).end();}
  if (req.method !== 'POST') {return res.status(405).json({ message: 'Only POST requests allowed' });}
  const { to, subject, htmlTemplate } = req.body;
  if (!to || !subject || !htmlTemplate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {const transporter = nodemailer.createTransport({service: 'gmail', 
      auth: {user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_APP_PASSWORD }});
    const mailOptions = {
      from: `"HamaraLabs Admin" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlTemplate};
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email dispatched successfully.' });

  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email.', error: error.message });
  }
}