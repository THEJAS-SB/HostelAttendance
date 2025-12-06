import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import StudentLogin from "./pages/StudentLogin"
import StudentRegister from "./pages/StudentRegister"
import StudentDashboard from "./pages/StudentDashboard"
import WardenLogin from "./pages/WardenLogin"
import WardenDashboard from "./pages/WardenDashboard"
import Notifications from "./pages/Notifications"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/warden-login" element={<WardenLogin />} />
      <Route path="/warden-dashboard" element={<WardenDashboard />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  )
}
