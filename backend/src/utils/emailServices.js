
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


//for production use
// import {Resend} from "resend";
// import dotenv from "dotenv";
// dotenv.config();  

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: process.env.RESEND_EMAIL_FROM,
//       to,
//       subject,
//       html,
//     });

//     if (error) {
//       console.error("Resend Error:", error);
//       throw new Error("Email sending failed");
//     }

//     return data;
//   } catch (err) {
//     console.error("Send Email Error:", err);
//     throw new Error("Email service failed");
//   }
// };