import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();    


export function generateOtp(length = Number(process.env.OTP_LENGTH) || 6) {                      //default length 6
  // generate securely and map to digits
  const bytes = crypto.randomBytes(length);
  const digits = Array.from(bytes).map(b => (b % 10).toString()).join("");
  // if length mismatch for any reason, pad/truncate:
  return digits.slice(0, length).padStart(length, "0");      // padStarts used  to ensure length
}
