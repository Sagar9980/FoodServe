import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
});

export default mongoose.model("user", userSchema);
