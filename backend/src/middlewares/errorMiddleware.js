export default (err, req, res, next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File is too large. Max 5MB." });
  }
  if (err.message && err.message.includes("Only .png")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || "Internal Server Error" });
};
