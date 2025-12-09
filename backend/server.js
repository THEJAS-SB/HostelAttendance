import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cron from "node-cron"
import { User } from "./models/User.js"
import { Attendance } from "./models/Attendance.js"
import { RoomChangeRequest } from "./models/RoomChangeRequest.js"
import { authMiddleware } from "./middleware/auth.js"

dotenv.config()
const app = express()

// FIXED CORS 🚀
const allowedOrigins = [
  "http://localhost:5173",
  "https://ts-technovate-hostelattendance.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json())

// DB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.log("DB Error:", err))

const getToday = () => new Date().toISOString().split("T")[0]

// REGISTER STUDENT
app.post("/api/student/register", async (req, res) => {
  try {
    const {
      regNo,
      name,
      parentMobile,
      studentMobile,
      roomNo,
      dept,
      password
    } = req.body

    if (!/^[A-Z]{2,5}-[A-Z]$/.test(dept)) {
      return res.status(400).json({ message: "Dept must be like CSE-D" })
    }

    if (parentMobile.length !== 10 || studentMobile.length !== 10) {
      return res.status(400).json({ message: "Mobile must be 10 digits" })
    }

    const regUpper = regNo.toUpperCase()
    const exists = await User.findOne({ regNo: regUpper })
    if (exists) return res.status(400).json({ message: "Already Registered!" })

    const hash = await bcrypt.hash(password, 10)

    await User.create({
      regNo: regUpper,
      name,
      parentMobile,
      studentMobile,
      roomNo,
      dept,
      passwordHash: hash,
      role: "student"
    })

    res.json({ message: "Student Registered Successfully" })

  } catch (err) {
    res.status(500).json({ message: "Register Failed" })
  }
})

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
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
      { id: user._id, role: user.role, regNo: user.regNo },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({ message: "Logged In", token, role: user.role })
  } catch {
    res.status(500).json({ message: "Login Failed" })
  }
})

// GET PROFILE
app.get("/api/me", authMiddleware(["student", "warden"]), async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash")
  res.json(user)
})

// ATTENDANCE MARKING
app.post("/api/attendance/mark", authMiddleware(["student"]), async (req, res) => {
  const hour = new Date().getHours()
  if (!(hour >= 19 && hour < 22))
    return res.status(400).json({ message: "Attendance allowed only 7PM - 10PM" })

  const date = getToday()
  const record = await Attendance.findOneAndUpdate(
    { student: req.user.id, date },
    { status: req.body.status === "absent" ? "absent" : "present" },
    { new: true, upsert: true }
  )
  res.json({ message: "Attendance updated", status: record.status })
})

// WARDEN REPORT
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
    let status = recMap.get(key)

    if (!status) {
      if (date < todayStr) status = "not_responded_absent"
      else if (date > todayStr) status = "pending"
      else status = hour >= 22 ? "not_responded_absent" : "pending"
    }

    return {
      regNo: s.regNo,
      name: s.name,
      dept: s.dept,
      roomNo: s.roomNo,
      parentMobile: s.parentMobile,
      studentMobile: s.studentMobile,
      status
    }
  })
  res.json(data)
})

// ROOM CHANGE REQUEST
app.post("/api/student/room-change-request", authMiddleware(["student"]), async (req, res) => {
  const student = await User.findById(req.user.id)
  if (student.roomNo === req.body.newRoom)
    return res.status(400).json({ message: "Already same room" })

  const pending = await RoomChangeRequest.findOne({
    student: student._id,
    status: "pending"
  })
  if (pending) return res.status(400).json({ message: "Already pending" })

  await RoomChangeRequest.create({
    student: student._id,
    newRoom: req.body.newRoom,
    status: "pending"
  })
  res.json({ message: "Request sent" })
})

// STUDENT STATUS
app.get("/api/student/room-change-status", authMiddleware(["student"]), async (req, res) => {
  const request = await RoomChangeRequest.findOne({
    student: req.user.id,
    status: "pending"
  }).sort({ createdAt: -1 })

  res.json({
    pending: !!request,
    newRoom: request ? request.newRoom : null
  })
})

// STUDENT NOTIFICATION
app.get("/api/student/room-change-notification", authMiddleware(["student"]), async (req, res) => {
  const request = await RoomChangeRequest.findOne({
    student: req.user.id,
    status: { $in: ["approved", "rejected"] }
  }).sort({ updatedAt: -1 })

  if (!request) return res.json({ hasNotification: false })

  res.json({
    hasNotification: true,
    status: request.status,
    newRoom: request.newRoom
  })
})

// CLEAR
app.post("/api/student/room-change-notification/clear", authMiddleware(["student"]), async (req, res) => {
  await RoomChangeRequest.deleteMany({
    student: req.user.id,
    status: { $in: ["approved", "rejected"] }
  })
  res.json({ message: "Cleared" })
})

// ADMIN VIEW REQUESTS
app.get("/api/admin/room-requests", authMiddleware(["warden"]), async (req, res) => {
  const list = await RoomChangeRequest.find({ status: "pending" })
    .populate("student", "regNo name roomNo dept")
    .sort({ createdAt: -1 })

  res.json(list.map((r) => ({
    _id: r._id,
    regNo: r.student.regNo,
    name: r.student.name,
    currentRoom: r.student.roomNo,
    newRoom: r.newRoom,
    dept: r.student.dept,
    status: r.status
  })))
})

// APPROVE
app.post("/api/admin/room-requests/:id/approve", authMiddleware(["warden"]), async (req, res) => {
  const request = await RoomChangeRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ message: "Not found" })

  const student = await User.findById(request.student)
  student.roomNo = request.newRoom
  await student.save()

  request.status = "approved"
  await request.save()

  res.json({ message: "Approved" })
})

// REJECT
app.post("/api/admin/room-requests/:id/reject", authMiddleware(["warden"]), async (req, res) => {
  const request = await RoomChangeRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ message: "Not found" })

  request.status = "rejected"
  await request.save()

  res.json({ message: "Rejected" })
})

// CRON (10:01PM AUTO-ABSENT)
cron.schedule("1 22 * * *", async () => {
  const date = getToday()
  const students = await User.find({ role: "student" })
  const records = await Attendance.find({ date })
  const marked = new Set(records.map(r => String(r.student)))

  for (const s of students) {
    if (!marked.has(String(s._id))) {
      await Attendance.create({ student: s._id, date, status: "absent" })
    }
  }
  console.log("Auto-absent updated ✔")
})

// ROOT CHECK ✔
app.get("/", (req, res) => {
  res.send("API Running... 🚀")
})

// SERVER
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Backend Running on PORT ${PORT}`)
)
