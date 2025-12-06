import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

export default function StudentRegister() {
  const [regNo, setRegNo] = useState("")
  const [name, setName] = useState("")
  const [parentMobile, setParentMobile] = useState("")
  const [studentMobile, setStudentMobile] = useState("")
  const [roomNo, setRoomNo] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const navigate = useNavigate()

  const submit = async () => {
    if (parentMobile.length !== 10 || studentMobile.length !== 10) {
      setMsg("Mobile numbers must be 10 digits")
      return
    }
    try {
      await axios.post("http://localhost:5000/api/student/register", {
        regNo,
        name,
        parentMobile,
        studentMobile,
        roomNo,
        password
      })
      navigate("/student-login")
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration Failed")
    }
  }

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
      <div className="bg-white p-8 shadow-xl rounded-2xl w-96">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Student Register</h2>
        <input
          type="text"
          placeholder="Reg No"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value.toUpperCase())}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="number"
          placeholder="Parent Mobile"
          value={parentMobile}
          onChange={(e) => setParentMobile(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="number"
          placeholder="Student Mobile"
          value={studentMobile}
          onChange={(e) => setStudentMobile(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="text"
          placeholder="Room No"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
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
          Register
        </button>
        {msg && <p className="mt-3 text-red-600">{msg}</p>}
        <p className="text-sm mt-3 text-center">
          Already registered?{" "}
          <Link to="/student-login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
