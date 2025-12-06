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
      const res = await axios.post("http://localhost:5000/api/login", {
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
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="bg-white p-8 shadow-xl rounded-2xl w-80">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Student Login</h2>
        <input
          type="text"
          placeholder="Register Number"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value.toUpperCase())}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
        {msg && <p className="mt-3 text-red-600">{msg}</p>}
        <p className="text-sm mt-3 text-center">
          No account?{" "}
          <Link to="/student-register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
