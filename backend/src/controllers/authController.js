import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.js";

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      password: hash
    });

    await user.save();

    const token = createToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.isBlocked) {
      return res.status(403).json({ message: `Your account is blocked. Reason: ${user.blockedReason || "No reason provided"}` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials or wrong passward" });

    const token = createToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role }});
  } catch (err) {
    next(err);                //pass error to global error handler
  }
};
