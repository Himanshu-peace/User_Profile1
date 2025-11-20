import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import seedAdmin from "./utils/seedAdmin.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    await seedAdmin();                    // ensures admin exists and if not, creates one
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

await start();

app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
