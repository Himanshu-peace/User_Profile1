import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import User from "../model/user.js";
import { processAndSaveImage } from "../utils/fileHandler.js";
import { createAndSendOtp, verifyOtp } from "../utils/otpHelper.js";
import { sendEmail } from "../utils/emailServices.js";                      


// const uploadsDir = path.join(new URL('.', import.meta.url).pathname, 'uploads'); // not used directly but kept for reference

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");                 // -password to exclude password field
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isBlocked) {
      return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason}` });
    };
    if(!user.isActive) {
      return res.status(403).json({ message: `Your account is Deactivated. Click to restore your acount` });
    }
    res.json(user);                                   //return user data except password
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    // const allowed = ["fullName", "email", "profile.dateOfBirth", "profile.address", "profile.maritalStatus", "profile.currentLocation", "profile.phone"];
    // For simplicity, accept full body keys and merge
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isBlocked) {
      return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason || "Inappropriate profile data, after review and uptadion you will be unblocked."}` });
    }
    
    if(!user.isActive) {
      return res.status(403).json({ message: `Your account is Deactivated. Click to restore your acount` });
    }

    if (!user.isVerified){
      return res.status(403).json({ message: `Your account is not verified. Click to below to verifiy` });
    }

    // handle photo if uploaded (multer put it in req.file)
    if (req.file) {
      const savedRelativePath = await processAndSaveImage(req.file);
      user.profile.photo = savedRelativePath;
    }
    // merge allowed fields (basic)
    const incoming = req.body;
    user.fullName = incoming.fullName || user.fullName;
    user.email = incoming.email || user.email;
    user.profile.dob = incoming.dateOfBirth ? new Date(incoming.dateOfBirth) : user.profile.dob;
    user.profile.address = incoming.address || user.profile.address;
    user.profile.maritalStatus = incoming.maritalStatus || user.profile.maritalStatus;
    user.profile.currentLocation = incoming.currentLocation || user.profile.currentLocation;
    user.profile.phone = incoming.phone || user.profile.phone;

    await user.save();

    const safe = user.toObject();            // convert to plain object to delete password // mongoose doc has no delete
    delete safe.password;
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await createAndSendOtp({
      email,
      purpose: "RESET_PASSWORD",
      sendFn: sendEmail
    });

    return res.json({ message: "OTP sent to your email for password reset" });
  } catch (err) {
    next(err);
  }
};


export const updatePassword = async (req, res, next) => {
  try {
    const { email, otp, currentPassword, newPassword } = req.body; 
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const { ok, reason } = await verifyOtp({ email, purpose: "RESET_PASSWORD", otp });
    if (!ok) return res.status(400).json({ message: reason });
    console.log(ok, reason);


    const user = await User.findById(req.user.id).select("+password");  // explicitly select password field
    if (!user || !user.password) return res.status(404).json({ message: "User not found" });
    // console.log(user);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect! Try Again!" });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    user.password = hash;
    await user.save();

    const to = user.email;
    const subject = "Your password has been changed";
    const html = `<p>Your password was changed successfully at ${new Date().toISOString()}.</p>`;
    const text = `Password changed successfully at ${new Date().toISOString()}.`;
    
    await sendEmail(to, subject, html, text);

    res.json({ message: "Password updated successfully" });
    
  } catch (err) {
    next(err);
  }
};

export const deactivateMe = async (req, res, next) => {                    
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = false;
    await user.save();
    res.json({ message: "User account deactivated" });
  } catch (err) {
    next(err);
  } 
}

export const activateMe = async (req, res, next) => {                         // restoring instead of deleting
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = true;
    await user.save();
    res.json({ message: "User account restored" });
  } catch (err) {
    next(err);
  } 
}; 

export const deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Optionally remove photo file
    if (user.profile?.photo) {   // check if photo exists then delete
      const fpath = path.join(process.cwd(), "src", user.profile.photo); // construct full path to file for deletion
      fs.unlink(fpath, (e) => {});                              // delete file async, ignore errors
    }
    res.json({ message: "User deleted permanently" });
  } catch (err) {
    next(err);
  }
};

/* ADMIN controllers */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");                   //find all non-admin users
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBlocked = true;
    user.blockedReason = reason || "Inappropriate profile data, after review and uptadion you will be unblocked.";
    await user.save();
    res.json({ message: "User blocked", userId: id, reason: user.blockedReason });
  } catch (err) {
    next(err);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBlocked = false;
    user.blockedReason = null;
    await user.save();
    res.json({ message: "User unblocked", userId: id });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // const allowed = ["fullName", "email", "profile.dateOfBirth", "profile.address", "profile.maritalStatus", "profile.currentLocation", "profile.phone"];
    // For simplicity, accept full body keys and merge
    const userId = req.params;
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    // if (user.isBlocked) {                                              //don't check this if admin is updating user
    //   return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason || "Inappropriate profile data, after review and uptadion you will be unblocked."}` });
    // }

    // handle photo if uploaded (multer put it in req.file)
    if (req.file) {                                                                   
      const savedRelativePath = await processAndSaveImage(req.file);
      user.profile.photo = savedRelativePath;
    }
    // merge allowed fields (basic)
    const incoming = req.body;            
    user.fullName = incoming.fullName || user.fullName;
    user.email = incoming.email || user.email;
    user.profile.dob = incoming.dateOfBirth ? new Date(incoming.dateOfBirth) : user.profile.dob;
    user.profile.address = incoming.address || user.profile.address;
    user.profile.maritalStatus = incoming.maritalStatus || user.profile.maritalStatus;
    user.profile.currentLocation = incoming.currentLocation || user.profile.currentLocation;
    user.profile.phone = incoming.phone || user.profile.phone;

    await user.save();
    const safe = user.toObject();            // convert to plain object to delete password // mongoose doc has no delete
    delete safe.password;
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

export const deleteUserPermanently = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // cleanup file if exists
    if (user.profile?.photo) {
      const fpath = path.join(process.cwd(), "src", user.profile.photo);
      fs.unlink(fpath, (e) => {});
    }
    res.json({ message: "User permanently deleted" });
  } catch (err) {
    next(err);
  }
};
