import mongoose from "mongoose"

const roomChangeRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    newRoom: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
)

export const RoomChangeRequest = mongoose.model("RoomChangeRequest", roomChangeRequestSchema)
