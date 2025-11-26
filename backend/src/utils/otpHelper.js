import OTP from "../model/otp.js";       
import  { generateOtp } from "./generateOtp.js";
import bcrypt from "bcrypt";


 //createAndSendOtp({email, purpose, sendFn})
 //creates OTP (hash or plain), stores in DB with expiry, calls sendFn({to, subject, html, text})
 //returns the created OTP record (not otp value if hashed)
 

export async function createAndSendOtp({ email, purpose, sendFn }) {

  const length = Number(process.env.OTP_LENGTH) || 6;
  const expirationMinutes = Number(process.env.OTP_EXPIRATION_MINUTES) || 10;
  const otp = generateOtp(length);
  // console.log(otp); //workin till here

  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  const useHash = String(process.env.OTP_HASH || "true").toLowerCase() === "true";
  // console.log(useHash)
  let store = { email, purpose, expiresAt };

  
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    store.otpHash = otpHash;

  // console.log(store); //includes otp hash or plain

  // Remove previous OTPs for same email+purpose to avoid multiple valid tokens
  await OTP.deleteMany({ email, purpose });

  const record = await OTP.create(store);

  console.log(record);    //for testing

  // send email
  const to = email;
  const subject = purpose === "REGISTER" ? "Verify your email" : "Your password reset code";
  const html = `<p>Your verification code is <b>${otp}</b>. It will expire in ${expirationMinutes} minutes.</p>`;
  const text = `Your verification code is ${otp}. It will expire in ${expirationMinutes} minutes.`;

  await sendFn(  to, subject, html, text );

  // If hashed, we do NOT return otp (for security). Caller might need it for tests.
  return { recordId: record._id, expiresAt, otp: useHash ? undefined : otp, hashed: useHash };
}


//  verifyOtp({email, purpose, otp})
// - returns true if verified, and deletes used OTPs

export async function verifyOtp({ email, purpose, otp }) {
  const rec = await OTP.findOne({ email, purpose });
  // console.log(rec); //for testing
  if (!rec) return { ok: false, reason: "OTP not found or expired" };       

  let match = false;
  match = await bcrypt.compare(otp, rec.otpHash);
  if (!match) return { ok: false, reason: "Invalid OTP" };
  // delete used OTP(s)
  await OTP.deleteMany({ email, purpose });

  return { ok: true, reason: "OTP verified" };
}
