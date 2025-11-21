import express from "express";
import multer from "multer";
import path from "path";
import { getMe, updateMe, deleteMe, getAllUsers, blockUser, unblockUser, deleteUserPermanently } from "../controllers/userController.js";
import auth from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// multer setup (store in memory for processing by sharp)
//all multer methods are - upload.single(fieldname) | upload.array(fieldname, maxCount) | upload.fields([{ name: fieldname, maxCount }, ...])
const upload = multer({
  storage: multer.memoryStorage(),                                             // store files in memory as Buffer objects for processing then transfer to disk
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();                  // get file extension
    if (allowed.test(ext)) cb(null, true);                                      // accept file if extension allowed/matches
    else cb(new Error("Only .png, .jpg and .jpeg format allowed"));             // reject file throw error explicitly
  }
});

// user routes
router.get("/me", auth, getMe); // get current user's profile
router.put("/me/", auth, upload.single("photo"), updateMe); // multipart/form-data with optional "photo" field
router.patch("/me/", auth, upload.single("photo"), updateMe);       // alternate PATCH method for partial update
//partial delete - deactivate account
// router.patch("/me/deactivate", auth, deactivateMe async (req, res, next) => {                    // deactivating instead of deleting
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     user.isActive = false;
//     await user.save();
//     res.json({ message: "User account deactivated" });
//   } catch (err) {
//     next(err);
//   } 
// });
//restore deactivated account
// router.patch("/me/restore", auth, activateMe, async (req, res, next) => {                         // restoring instead of deleting
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     user.isActive = true;
//     await user.save();
//     res.json({ message: "User account restored" });
//   } catch (err) {
//     next(err);
//   } 
// });

// full delete - delete account permanently
router.delete("/me/", auth, deleteMe);



// admin routes
router.get("/", auth, requireRole("admin"), getAllUsers);
router.patch("/:id/block", auth, requireRole("admin"), blockUser);
router.patch("/:id/unblock", auth, requireRole("admin"), unblockUser);
// router.patch("/:id/update", auth, requireRole("admin"), upload.single("photo"), updateMe);   // optional: admin can update any user
router.delete("/:id", auth, requireRole("admin"), deleteUserPermanently);

export default router;