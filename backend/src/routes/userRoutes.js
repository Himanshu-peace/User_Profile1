import express from "express";
import multer from "multer";
import path from "path";
import { getMe, updateMe, deleteMe, getAllUsers, blockUser, unblockUser, deleteUserPermanently } from "../controllers/userController.js";
import auth from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// multer setup (store in memory for processing by sharp)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only .png, .jpg and .jpeg format allowed"));
  }
});

// user routes
router.get("/me", auth, getMe); // get current user's profile
router.put("/me/", auth, upload.single("photo"), updateMe); // multipart/form-data with optional "photo" field
router.delete("/me/", auth, deleteMe);


// admin routes
router.get("/", auth, requireRole("admin"), getAllUsers);
router.patch("/:id/block", auth, requireRole("admin"), blockUser);
router.patch("/:id/unblock", auth, requireRole("admin"), unblockUser);
router.delete("/:id", auth, requireRole("admin"), deleteUserPermanently);

export default router;