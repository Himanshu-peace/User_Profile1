import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "..", "uploads");

// ensure uploads exists
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

/**
 * Accepts multer file (in memory) and processes via sharp
 * Returns relative path like "uploads/imagename.jpg" (relative to src/)
 */
export async function processAndSaveImage(file) {
  // file: { buffer, mimetype, originalname }
  const timestamp = Date.now();
  const ext = file.mimetype === "image/png" ? "png" : "jpg";
  const filename = `photo_${timestamp}.${ext}`;
  const outPath = path.join(uploadsPath, filename);

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
  const relative = path.join("uploads", filename); // src/uploads/filename
  return relative;
}
