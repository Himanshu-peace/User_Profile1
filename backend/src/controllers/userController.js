import fs from "fs";
import path from "path";
import User from "../model/user.js";
import { processAndSaveImage } from "../utils/fileHandler.js";

const uploadsDir = path.join(new URL('.', import.meta.url).pathname, 'uploads'); // not used directly but kept

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");                 // exclude password query
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isBlocked) {
      return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason || "No reason provided"}` });
    };
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
      return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason || "No reason provided"}` });
    }

    // handle photo if uploaded (multer put it in req.file)
    if (req.file) {
      const savedRelativePath = await processAndSaveImage(req.file);
      user.profile.photo = savedRelativePath;
    }

    // merge allowed fields (basic)
    const incoming = req.body;
    // if (incoming.fullName) user.fullName = incoming.fullName;
    // if (incoming.email) user.email = incoming.email;
    // if (incoming.dateOfBirth) user.profile.dob = new Date(incoming.dateOfBirth);
    // if (incoming.address) user.profile.address = incoming.address;
    // if (incoming.maritalStatus) user.profile.maritalStatus = incoming.maritalStatus;
    // if (incoming.currentLocation) user.profile.currentLocation = incoming.currentLocation;
    // if (incoming.phone) user.profile.phone = incoming.phone;

    // Alternatively, a more dynamic approach:
    user.fullName = incoming.fullName || user.fullName;
    user.email = incoming.email || user.email;
    user.profile.dob = incoming.dateOfBirth ? new Date(incoming.dateOfBirth) : user.profile.dob;
    user.profile.address = incoming.address || user.profile.address;
    user.profile.maritalStatus = incoming.maritalStatus || user.profile.maritalStatus;
    user.profile.currentLocation = incoming.currentLocation || user.profile.currentLocation;
    user.profile.phone = incoming.phone || user.profile.phone;

    await user.save();
    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Optionally remove photo file
    if (user.profile?.photo) {
      const fpath = path.join(process.cwd(), "src", user.profile.photo);
      fs.unlink(fpath, (e) => {});
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

/* ADMIN controllers */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
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
    user.blockedReason = reason || "Blocked by admin";
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
