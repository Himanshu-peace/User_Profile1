import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    index: true
},
  otpHash:{
    type: String,
  },
  purpose: { 
    type: String, 
    enum: ["REGISTER", "RESET_PASSWORD"], 
    required: true },
  createdAt: { 
    type: Date, 
    default: Date.now 
},
  expiresAt: { 
    type: Date, 
    required: true 
},
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });   // TTL index to auto-delete expired OTPs // documents will be removed once expiresAt is reached

export default mongoose.model("OTP", otpSchema);
