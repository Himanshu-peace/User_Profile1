import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import { createAndSendOtp, verifyOtp } from "../utils/otpHelper.js";
import { sendEmail } from "../utils/emailServices.js";

const createToken = (user) => {
  return jwt.sign(                                       // sign method takes payload as an object, secret key, options like expiration of token
    { id: user._id, role: user.role, email: user.email },                           
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
  
    const ifexist = await User.findOneAndDelete({email})

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      password: hash,
      isVarified: false
    });

    await user.save(); 


    await createAndSendOtp({
      email: user.email,
      purpose: "REGISTER",
      sendFn: sendEmail                // function to send email 
    });

    const adminEmail = process.env.ADMIN_EMAIL;         //notify admin of new registration

    const to= adminEmail;
    const subject=  "New user registered"
    const html = `<p>User <b>${email}</b> registered at ${new Date().toISOString()}.</p>`
    const text = `user${email} registered at ${new Date().toISOString()}.`;

    if (adminEmail) {
      await sendEmail(to , subject, html, text);
    };


    return res.status(201).json({ message: "Registered. Check your email for OTP to verify account." });

    // const token = createToken(user);                             //optionally log in user upon registration.
    // res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { ok, reason } = await verifyOtp({ email, purpose: "REGISTER", otp });
    if (!ok) return res.status(400).json({ message: reason });

    await User.findOneAndUpdate({ email }, { isVerified: true });

    // notify admin that verification completed (optional)
    const adminEmail = process.env.ADMIN_EMAIL;         //notify admin of new registration
    const to= adminEmail;
    const subject=  "User email verified"
    const html = `<p>User <b>${email}</b> verified their email at ${new Date().toISOString()}.</p>`
    const text = `user${email} verified at ${new Date().toISOString()}.`;
    
    if (adminEmail) {
      await sendEmail(to , subject, html, text);
    };

    return res.json({ message: "Email verified successfully" });

  } catch (err) {
    next(err);
  }
};

export const resendOtp = async(req,res,next)=> {
  try{
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) return res.status(404).json({ message: "User not found" });

    if(user.isVerified) return res.status(403).json({ message: "Email already verified" });
    
    await createAndSendOtp({
      email: user.email,
      purpose: "REGISTER",
      sendFn: sendEmail                // function to send email 
    });
  }catch(err){
    next(err);
  }
}


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.isBlocked) {
      return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason || "No reason provided"}` });
    }

    if (!user.isActive){
      return  res.status(403).json({ message: `Your account is Deactivated. Click to restore your acount` });
    };

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
    };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials or wrong passward" });

    const token = createToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role }});
  } catch (err) {
    next(err);                                             //pass error to global error handler
  }
};