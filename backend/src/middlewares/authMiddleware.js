import jwt from "jsonwebtoken";

export default function auth(req, res, next) {                                       
  try {
    const header = req.headers.authorization;  //headers contain authorization info is the form Bearer <token>
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);                                // verify token with secret key stored in env variable 
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };                  // attach user info to request object 
    //now req object contain user info and body contain request data
    next();      //proceed to next middleware controller or error handler
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}






























//while logging in -->
//attach user info to req object for use in next middlewares or route handlers
//token is expected in Authorization header as Bearer <token>
//if token is missing, invalid or expired, respond with 401 Unauthorized
//if valid, decode token and attach user id, role and email to req.user
//call next() to proceed to next middleware or route handler
//this middleware should be used on routes that require authentication
//e.g. app.get("/api/protected", auth, protectedRouteHandler)
//protectedRouteHandler can access req.user to get authenticated user info
//make sure to set JWT_SECRET in your environment variables for token verification
//you can customize error messages as needed