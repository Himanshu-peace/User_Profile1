import mongoose from "mongoose";

const connectDB = async (mongoURI) => {
  if (!mongoURI) throw new Error("MONGO_URI not provided");
  await mongoose.connect(mongoURI, {
    // mongoose 7 uses sensible defaults
  });
  return mongoose.connection;                            // return the connection object
};

export default connectDB;
