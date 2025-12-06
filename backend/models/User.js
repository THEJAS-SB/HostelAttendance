import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  parentMobile: String,
  studentMobile: String,
  roomNo: String,
  passwordHash: { type: String, required: true },
  role: { type: String, required: true }
})

export const User = mongoose.model("User", userSchema)
