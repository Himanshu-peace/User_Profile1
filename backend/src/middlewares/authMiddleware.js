import jwt from "jsonwebtoken";

export default function auth(req, res, next) {                                       // authentication middleware cheaking JWT token
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);                                // verify token with secret key stored in env variable 
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };                  // attach user info to request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
