import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/user.js";''
// import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { createAndSendOtp, verifyOtp } from "../utils/otpHelper.js";
import { sendEmail } from "../utils/emailServices.js";
import {addTokenToBlacklist} from "../utils/tokenBlacklist.js";

const oauthClient = new OAuth2Client(              // create an instance of OauthClient
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
); // create an instance of OauthClient

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

    console.log("success");  //for testing

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
    // if (!user) return res.status(404).json({ message: "Otp sent check your email" });

    // if(user.isVerified) return res.status(403).json({ message: "Email already verified" });
    
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

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    addTokenToBlacklist(token);

    return res.status(200).json({
      message: "Logged out successfully."
    });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const googleAuth = async (req, res, next) => {         //redirect user to google for authentication
  try {
    const url = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [                                       //scope to request
        "profile",
        "email"
      ]
    });

    res.redirect(url);                              // this url sends user to google and prompts them to login, attach callback url with a query parameter 
  } catch (error) {
    next(error);
  }
};


export const googleAuthCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauthClient.getToken(code);      //exchange code for tokens
    oauthClient.setCredentials(tokens);                       //set credentials

    const ticket = await oauthClient.verifyIdToken({          //verify id token
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();                        //get payload from ticket

    let user = await User.findOne({ email: payload.email });
    if (user && user.authType !== "google") {
      return res.status(400).json({ message: "User already registered with different auth type" });
    }

    if (!user) {
      user = await User.create({
        fullName: payload.name,
        email: payload.email,
        password: null,
        authType: "google",
        profile: {
          photo: payload.picture,
        }
      });
    }

    const token = createToken(user);
    return res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role, authType: user.authType}});
    // Redirect to frontend with token
      // return res.redirect(
      //   `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
      // );

  } catch (error) {
    next(error);
  }
};
