import express from "express";
import multer from "multer";
import path from "path";
import { validate } from "../middlewares/validationMiddleware.js";
import {updateUserSchema, fullUpdateUserSchema, newPasswordSchema } from "../validators/userValidator.js"
// improt updateUserSchema from
import { getMe, updateMe, requestPasswordReset, updateUser, updatePassword, deactivateMe, activateMe, deleteMe, getAllUsers, blockUser, unblockUser, deleteUserPermanently } from "../controllers/userController.js";
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
router.get("/me", auth, getMe);                                                                       // get current user's profile
router.put("/me/", auth, validate(fullUpdateUserSchema), upload.single("photo"), updateMe);                   // multipart/form-data with optional "photo" field
router.patch("/me/", auth, validate(updateUserSchema), upload.single("photo"), updateMe);                 // alternate PATCH method for partial update
router.post("/me/request-reset", auth, requestPasswordReset);                                         //genrate's otp for password
router.patch("/me/change-pass", auth, validate(newPasswordSchema), updatePassword);                       // change password   {emai, otp, currentPassword, newPassword } = req.body; 
router.patch("/me/deactivate", auth, deactivateMe);                                                   // deactivate account
router.patch("/me/restore", auth, activateMe);                                                        // restore deactivated account
router.delete("/me/", auth, deleteMe);                                                                // full delete - delete account permanently


// admin routes
router.get("/", auth, requireRole("admin"), getAllUsers);
router.patch("/:id/block", auth, requireRole("admin"), blockUser);
router.patch("/:id/unblock", auth, requireRole("admin"), unblockUser);
router.patch("/:id/owner", validate(updateUserSchema), auth, requireRole("admin"), upload.single("photo"), updateMe);             //takes admins id as param to update admin 
router.patch("/:id/updateUser", validate(updateUserSchema), auth, requireRole("admin"), upload.single("photo"), updateUser);      // use userId param to identify user to update
router.delete("/:id", auth, requireRole("admin"), deleteUserPermanently);                                                         //
 
export default router;