import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

export default function StudentRegister() {
  const [regNo, setRegNo] = useState("")
  const [name, setName] = useState("")
  const [parentMobile, setParentMobile] = useState("")
  const [studentMobile, setStudentMobile] = useState("")
  const [roomNo, setRoomNo] = useState("")
  const [dept, setDept] = useState("")
  const [password, setPassword] = useState("")
  const [floor, setFloor] = useState("")
  const [warden, setWarden] = useState("")
  const [msg, setMsg] = useState("")

  const navigate = useNavigate()

  const submit = async () => {
    if (!/^[A-Z]{2,5}-[A-Z]$/.test(dept)) {
      setMsg("Dept should be like CSE-D")
      return
    }

    if (parentMobile.length !== 10 || studentMobile.length !== 10) {
      setMsg("Mobile numbers must be 10 digits")
      return
    }

    if (!floor || !warden) {
      setMsg("Please select Floor and Warden")
      return
    }

    try {
      await axios.post(
  "https://hostelattendance-egok.onrender.com/api/student/register",
  {
    regNo,
    name,
    parentMobile,
    studentMobile,
    roomNo,
    dept,
    password,
    floor,     // ✅ MUST be here
    warden,    // ✅ MUST be here
  }
)

      navigate("/student-login")
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration Failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 w-full max-w-md">

        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-6">
          Student Register
        </h2>

        {/* Reg No */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">🆔</div>
          <input
            type="text"
            placeholder="Reg No"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value.toUpperCase())}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        {/* Name */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">👤</div>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        
        {/* Parent Mobile */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">📞</div>
          <input
            type="number"
            placeholder="Parent Mobile"
            value={parentMobile}
            onChange={(e) => setParentMobile(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        {/* Student Mobile */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">📱</div>
          <input
            type="number"
            placeholder="Student Mobile"
            value={studentMobile}
            onChange={(e) => setStudentMobile(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        {/* Room No */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">🏠</div>
          <input
            type="text"
            placeholder="Room No"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        {/* Dept */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-5">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">🏛️</div>
          <input
            type="text"
            placeholder="Dept (Eg: CSE-D)"
            value={dept}
            onChange={(e) => setDept(e.target.value.toUpperCase())}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-5">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">🔒</div>
          <input
            type="password"
            placeholder="Password"
            className="flex-1 outline-none bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Floor Dropdown */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">🏢</div>
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          >
            <option value="">Select Floor</option>
            {[1,2,3,4,5,6,7,8,9].map(f => (
              <option key={f} value={f}>Floor {f}</option>
            ))}
          </select>
        </div>

        {/* Warden Dropdown */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-blue-50 shadow-sm mb-3">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700">🧑‍✈️</div>
          <select
            value={warden}
            onChange={(e) => setWarden(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          >
            <option value="">Select Warden</option>
            <option value="Saravana Kumar">Saravana Kumar</option>
            <option value="Prabhu">Prabhu</option>
          </select>
        </div>


        {/* Register */}
        <button
          onClick={submit}
          className="
w-full
bg-blue-600
hover:bg-blue-700
text-white
py-3
rounded-xl
text-lg font-semibold
shadow-lg shadow-blue-500/40
hover:shadow-blue-500/70
hover:scale-[1.05]
active:scale-[0.97]
border border-blue-400/40
transition-all duration-300
"
        >
          Register
        </button>

        {msg && (
          <p className="mt-4 text-center text-red-600 font-medium">{msg}</p>
        )}

        <p className="text-sm mt-4 text-center">
          Already registered?{" "}
          <Link to="/student-login" className="text-blue-600 underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}
