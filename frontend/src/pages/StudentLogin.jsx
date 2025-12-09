import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

export default function StudentLogin() {
  const [regNo, setRegNo] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const navigate = useNavigate()

  const submit = async () => {
    try {
      const res = await axios.post("https://hostelattendance-egok.onrender.com/api/login", {
        regNo,
        password
      })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.role)
      navigate("/student-dashboard")
    } catch (err) {
      setMsg(err.response?.data?.message || "Login Failed")
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">

      {/* Main Card */}
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl border border-blue-100">

        {/* Title */}
        <h2 className="text-3xl font-extrabold mb-6 text-blue-700 text-center">
          Student Login
        </h2>

        {/* Register Number */}
        <div className="mb-4">
          <label className="text-gray-700 font-medium text-sm">Register Number</label>
          <div className="flex items-center gap-3 mt-1 border rounded-xl p-3 shadow-sm bg-gray-50">
            <div className="p-2 rounded-md bg-blue-100 text-blue-700">🎓</div>
            <input
              type="text"
              placeholder="Enter Register Number"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value.toUpperCase())}
              className="bg-transparent flex-1 outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-gray-700 font-medium text-sm">Password</label>
          <div className="flex items-center gap-3 mt-1 border rounded-xl p-3 shadow-sm bg-gray-50">
            <div className="p-2 rounded-md bg-blue-100 text-blue-700">🔑</div>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent flex-1 outline-none"
            />
          </div>
        </div>

        {/* Login Button */}
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
hover:shadow-blue-500/60
hover:scale-[1.04] 
active:scale-[0.97]
border border-blue-400/30
transition-all duration-300
"

        >
          Login
        </button>

        {/* Error Message */}
        {msg && (
          <p className="mt-4 text-red-600 text-center font-medium">
            {msg}
          </p>
        )}

        {/* Register Link */}
        <p className="text-sm mt-5 text-center text-gray-700">
          No account?{" "}
          <Link to="/student-register" className="text-blue-600 font-bold">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
