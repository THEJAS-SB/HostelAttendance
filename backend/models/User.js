import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  parentMobile: {
    type: String,
    required: true
  },

  studentMobile: {
    type: String,
    required: true
  },

  roomNo: {
    type: String,
    required: true
  },

  // 🔥 NEW FIELDS (THIS WAS MISSING BEFORE)
  floor: {
    type: String,
    required: true
  },

  warden: {
    type: String,
    required: true
  },

  dept: {
    type: String,
    required: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    required: true
  }
})

export const User = mongoose.model("User", userSchema)
