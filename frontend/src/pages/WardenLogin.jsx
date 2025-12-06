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
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="bg-white p-8 shadow-xl rounded-xl w-80">
        <h2 className="text-xl font-bold mb-5 text-green-700">Warden Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Login
        </button>
        {msg && <p className="mt-3 text-red-600">{msg}</p>}
      </div>
    </div>
  )
}
