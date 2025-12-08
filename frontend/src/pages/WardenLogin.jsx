import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function WardenLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const navigate = useNavigate()

  const submit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        regNo: email,
        password
      })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.role)
      navigate("/warden-dashboard")
    } catch (err) {
      setMsg(err.response?.data?.message || "Login Failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex justify-center items-center p-6">
      
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 w-full max-w-md">

        <h2 className="text-3xl font-extrabold text-green-700 text-center mb-6">
          Warden Login
        </h2>

        {/* Email Field */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-green-50 shadow-sm mb-4">
          <div className="p-2 rounded-md bg-green-100 text-green-700">📧</div>
          <input
            type="email"
            placeholder="Enter Email"
            className="flex-1 outline-none bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div className="flex items-center gap-3 border rounded-xl p-3 bg-green-50 shadow-sm mb-4">
          <div className="p-2 rounded-md bg-green-100 text-green-700">🔒</div>
          <input
            type="password"
            placeholder="Enter Password"
            className="flex-1 outline-none bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={submit}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow font-semibold"
        >
          Login
        </button>

        {msg && (
          <p className="mt-4 text-center text-red-600 font-medium">{msg}</p>
        )}

      </div>
    </div>
  )
}
