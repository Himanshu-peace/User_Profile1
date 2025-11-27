import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();  

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


export const sendEmail = async (to, subject, html, text) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  });
  return info;
};
