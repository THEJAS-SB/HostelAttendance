import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["present", "absent"], required: true }
  },
  { timestamps: true }
)

attendanceSchema.index({ student: 1, date: 1 }, { unique: true })

export const Attendance = mongoose.model("Attendance", attendanceSchema)
