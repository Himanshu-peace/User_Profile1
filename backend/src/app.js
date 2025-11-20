import express from "express";                    
import morgan from "morgan";                                      
import path from "path";                                        
import { fileURLToPath } from "url";                             // to get __dirname in ES modules but in CJS it's available by default by using __dirname and __filename in every file 

import authRoutes from "./routes/authRoutes.js";                   // authentication routes
import userRoutes from "./routes/userRoutes.js";                   // user-related routes
import errorHandler from "./middlewares/errorMiddleware.js";   

const __filename = fileURLToPath(import.meta.url);             // get the current file path 
const __dirname = path.dirname(__filename);                    // get the current directory path

const app = express();

app.use(express.json());                // body parsing middleware
app.use(express.urlencoded({ extended: true }));        // body parsing middleware from URL-encoded forms
app.use(morgan("dev"));               

// serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));      // static file serving middleware

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// fallback-unmatched routes
app.use((req, res) => res.status(404).json({ message: "Route not found" })); 

app.use(errorHandler);                      // global error handler middleware

export default app;
