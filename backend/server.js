import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "./models/User.js"
import { Attendance } from "./models/Attendance.js"
import { RoomChangeRequest } from "./models/RoomChangeRequest.js"
import { authMiddleware } from "./middleware/auth.js"

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log(err))

const getToday = () => new Date().toISOString().split("T")[0]

app.post("/api/student/register", async (req, res) => {
  const { regNo, name, parentMobile, studentMobile, roomNo, password } = req.body
  const newReg = regNo.toUpperCase()
  if (parentMobile.length !== 10 || studentMobile.length !== 10) {
    return res.status(400).json({ message: "Phone numbers must be 10 digits" })
  }
  const exists = await User.findOne({ regNo: newReg })
  if (exists) return res.status(400).json({ message: "Already Registered!" })
  const hash = await bcrypt.hash(password, 10)
  await User.create({
    regNo: newReg,
    name,
    parentMobile,
    studentMobile,
    roomNo,
    passwordHash: hash,
    role: "student"
  })
  res.json({ message: "Student Registered Successfully" })
})

app.post("/api/login", async (req, res) => {
  const { regNo, password } = req.body
  let user
  if (regNo.includes("@")) {
    user = await User.findOne({ regNo, role: "warden" })
  } else {
    user = await User.findOne({ regNo: regNo.toUpperCase(), role: "student" })
  }
  if (!user) return res.status(404).json({ message: "User Not Found" })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: "Wrong Password" })
  const token = jwt.sign(
    { id: user._id, role: user.role, regNo: user.regNo, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  )
  res.json({ message: "Logged In", token, role: user.role })
})

app.get("/api/me", authMiddleware(["student", "warden"]), async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash")
  res.json(user)
})

app.post("/api/attendance/mark", authMiddleware(["student"]), async (req, res) => {
  const hour = new Date().getHours()
  if (!(hour >= 19 && hour < 22)) {
    return res.status(400).json({ message: "Attendance allowed only 7PM - 10PM" })
  }
  const date = getToday()
  const bodyStatus = req.body.status
  const status = bodyStatus === "absent" ? "absent" : "present"
  const record = await Attendance.findOneAndUpdate(
    { student: req.user.id, date },
    { status },
    { new: true, upsert: true }
  )
  res.json({ message: "Attendance updated", status: record.status })
})

app.get("/api/admin/report", authMiddleware(["warden"]), async (req, res) => {
  const date = req.query.date || getToday()
  const students = await User.find({ role: "student" })
  const records = await Attendance.find({ date })
  const recMap = new Map(records.map((r) => [String(r.student), r.status]))
  const now = new Date()
  const todayStr = getToday()
  const hour = now.getHours()
  const data = students.map((s) => {
    const key = String(s._id)
    const savedStatus = recMap.get(key)
    let status
    if (savedStatus) {
      status = savedStatus
    } else {
      if (date < todayStr) {
        status = "not_responded_absent"
      } else if (date > todayStr) {
        status = "pending"
      } else {
        if (hour >= 22) status = "not_responded_absent"
        else status = "pending"
      }
    }
    return {
      regNo: s.regNo,
      name: s.name,
      roomNo: s.roomNo,
      status
    }
  })
  res.json(data)
})

app.post("/api/student/room-change-request", authMiddleware(["student"]), async (req, res) => {
  const { newRoom } = req.body
  if (!newRoom || !newRoom.trim()) {
    return res.status(400).json({ message: "New room number required" })
  }
  const student = await User.findById(req.user.id)
  if (!student) return res.status(404).json({ message: "Student not found" })
  if (student.roomNo === newRoom.trim()) {
    return res.status(400).json({ message: "You are already in this room" })
  }
  const existingPending = await RoomChangeRequest.findOne({
    student: student._id,
    status: "pending"
  })
  if (existingPending) {
    return res.status(400).json({ message: "You already have a pending request" })
  }
  await RoomChangeRequest.create({
    student: student._id,
    newRoom: newRoom.trim(),
    status: "pending"
  })
  res.json({ message: "Room change request sent" })
})

app.get("/api/student/room-change-status", authMiddleware(["student"]), async (req, res) => {
  const request = await RoomChangeRequest.findOne({
    student: req.user.id,
    status: "pending"
  }).sort({ createdAt: -1 })
  if (!request) {
    return res.json({ pending: false, newRoom: null })
  }
  res.json({ pending: true, newRoom: request.newRoom })
})

app.get("/api/student/room-change-notification", authMiddleware(["student"]), async (req, res) => {
  const request = await RoomChangeRequest.findOne({
    student: req.user.id,
    status: { $in: ["approved", "rejected"] }
  }).sort({ updatedAt: -1 })
  if (!request) {
    return res.json({ hasNotification: false })
  }
  res.json({
    hasNotification: true,
    status: request.status,
    newRoom: request.newRoom
  })
})

app.post("/api/student/room-change-notification/clear", authMiddleware(["student"]), async (req, res) => {
  await RoomChangeRequest.deleteMany({
    student: req.user.id,
    status: { $in: ["approved", "rejected"] }
  })
  res.json({ message: "Cleared" })
})

app.get("/api/admin/room-requests", authMiddleware(["warden"]), async (req, res) => {
  const { status } = req.query
  const filter = status ? { status } : {}
  const list = await RoomChangeRequest.find(filter)
    .populate("student", "regNo name roomNo")
    .sort({ createdAt: -1 })
  const data = list.map((r) => ({
    _id: String(r._id),
    regNo: r.student.regNo,
    name: r.student.name,
    currentRoom: r.student.roomNo,
    newRoom: r.newRoom,
    status: r.status,
    requestedAt: r.createdAt
  }))
  res.json(data)
})

app.post("/api/admin/room-requests/:id/approve", authMiddleware(["warden"]), async (req, res) => {
  try {
    const { id } = req.params
    const request = await RoomChangeRequest.findById(id)
    if (!request) return res.status(404).json({ message: "Request not found" })
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" })
    }
    const student = await User.findById(request.student)
    if (!student) return res.status(404).json({ message: "Student not found" })
    student.roomNo = request.newRoom
    await student.save()
    request.status = "approved"
    await request.save()
    res.json({ message: "Room change approved" })
  } catch (err) {
    res.status(500).json({ message: "Approve Failed" })
  }
})

app.post("/api/admin/room-requests/:id/reject", authMiddleware(["warden"]), async (req, res) => {
  try {
    const { id } = req.params
    const request = await RoomChangeRequest.findById(id)
    if (!request) return res.status(404).json({ message: "Request not found" })
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" })
    }
    request.status = "rejected"
    await request.save()
    res.json({ message: "Room change rejected" })
  } catch (err) {
    res.status(500).json({ message: "Reject Failed" })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Backend Running on ${PORT}`))
