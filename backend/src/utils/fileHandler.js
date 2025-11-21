import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const uploadsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "uploads");       // path to uploads folder //how to get path of current module in ES6

// ensure uploads exists and create if not
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true })                  // fs.mkdirSync(path, { recursive: true }) creates parent dirs if not exist
}; 

/**
 * Accepts multer file (in memory) and processes via sharp
 * Returns relative path like "uploads/imagename.jpg" (relative to src/)
 */
export async function processAndSaveImage(file) {
  // file: { buffer, mimetype, originalname }
  const timestamp = Date.now();
  // determine extension and filename
  const ext = file.mimetype === "image/png" ? "png" : "jpg";              //optional use path.extname(file.originalname).toLowerCase().slice(1);
  const filename = `photo_${timestamp}.${ext}`;                           //saving as photo_timestamp.ext
  const outPath = path.join(uploadsPath, filename);                       // full path to save file

  // Use sharp to decompress/normalize image (resize to max 1024x1024)
  let sharpInstance = sharp(file.buffer).rotate();

  // limit max dimension to 1024
  sharpInstance = sharpInstance.resize({ width: 1024, height: 1024, fit: "inside" });

  if (ext === "png") {
    await sharpInstance.png({ quality: 90 }).toFile(outPath);
  } else {
    await sharpInstance.jpeg({ quality: 85 }).toFile(outPath);
  }

  // return relative path from src folder (so route /uploads/... works)
  const relative = path.join("uploads", filename);  // src/uploads/filename           in output it is uploads//filename.ect how to remove double slash? 
  return relative;
}
