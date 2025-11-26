import User from "../model/user.js";
import bcrypt from "bcrypt";

export default async function seedAdmin() {
  // read from env variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.");   //this is just a warning
    return;
  }

  const existing = await User.findOne({ email: adminEmail });           // check if admin already exists using email
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";                   // promote to admin if not already              
      await existing.save();
      console.log("Promoted existing user to admin:", adminEmail);          
    } else {
      console.log("Admin already exists:", adminEmail);
    }
    return;
  }
// create new admin user if existing not found
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(adminPass, salt);
  const admin = new User({
    fullName: "Admin",
    email: adminEmail,
    password: hash,
    role: "admin"
  });
  await admin.save();
  console.log("Admin seeded:", adminEmail);
}

