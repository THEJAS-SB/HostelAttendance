import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState("")
  const [roomMsg, setRoomMsg] = useState("")
  const [newRoom, setNewRoom] = useState("")
  const [roomPending, setRoomPending] = useState(false)
  const [pendingRoomTarget, setPendingRoomTarget] = useState("")
  const [notifyVisible, setNotifyVisible] = useState(false)
  const [notifyText, setNotifyText] = useState("")
  const [notifyStatus, setNotifyStatus] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (!token || role !== "student") {
      navigate("/student-login")
      return
    }
    loadUser()
    loadRoomPending()
    loadNotification()
  }, [])

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })

  const loadUser = async () => {
    const res = await axios.get("http://localhost:5000/api/me", getAuth())
    setUser(res.data)
  }

  const loadRoomPending = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/student/room-change-status",
      getAuth()
    )
    setRoomPending(res.data.pending)
    setPendingRoomTarget(res.data.newRoom || "")
  }

  const loadNotification = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/student/room-change-notification",
      getAuth()
    )
    if (res.data.hasNotification) {
      setNotifyStatus(res.data.status)
      if (res.data.status === "approved") {
        setNotifyText(`Your room change request is approved. New Room: ${res.data.newRoom}`)
      } else if (res.data.status === "rejected") {
        setNotifyText("Your room change request is rejected.")
      }
      setNotifyVisible(true)
    }
  }

  const mark = async (status) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        { status },
        getAuth()
      )
      setMsg(res.data.status.toUpperCase())
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed")
    }
  }

  const sendRoomRequest = async () => {
    setRoomMsg("")
    if (!newRoom.trim()) {
      setRoomMsg("Enter new room number")
      return
    }
    try {
      await axios.post(
        "http://localhost:5000/api/student/room-change-request",
        { newRoom },
        getAuth()
      )
      setRoomMsg("Request sent to warden")
      setNewRoom("")
      loadRoomPending()
    } catch (err) {
      setRoomMsg(err.response?.data?.message || "Failed to send request")
    }
  }

  const closeNotification = async () => {
    await axios.post(
      "http://localhost:5000/api/student/room-change-notification/clear",
      {},
      getAuth()
    )
    setNotifyVisible(false)
    loadUser()
    loadRoomPending()
  }

  const logout = () => {
    localStorage.clear()
    navigate("/student-login")
  }

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md p-8 shadow-lg rounded-2xl text-center border-blue-200 border">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Student Dashboard</h2>

        {user && (
          <div className="bg-blue-50 p-4 rounded-lg text-left shadow-sm mb-3">
            <p className="text-lg font-semibold text-blue-800">{user.name}</p>
            <p className="text-gray-700">Reg No: {user.regNo}</p>
            <p className="text-gray-700">Room No: {user.roomNo}</p>
          </div>
        )}

        {roomPending && (
          <p className="mb-3 text-sm text-yellow-700 bg-yellow-100 p-2 rounded-lg">
            Room change request pending to room {pendingRoomTarget}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <button
            onClick={() => mark("present")}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition"
          >
            Mark Present
          </button>
          <button
            onClick={() => mark("absent")}
            className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-lg transition"
          >
            Mark Absent
          </button>
        </div>

        {msg && (
          <p className="mt-4 text-sm font-medium text-blue-700 bg-blue-100 p-2 rounded-lg">
            {msg}
          </p>
        )}

        <div className="mt-5 border rounded-lg p-3 bg-gray-50 text-left">
          <p className="text-sm font-semibold mb-2">Request Room Change</p>
          <input
            type="text"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="border p-2 rounded w-full mb-2"
            placeholder="Enter new room number"
          />
          <button
            disabled={roomPending}
            onClick={sendRoomRequest}
            className={`w-full py-2 rounded ${
              roomPending
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-purple-600 text-white"
            }`}
          >
            {roomPending ? "Request Pending" : "Send Request"}
          </button>
          {roomMsg && (
            <p className="mt-2 text-sm text-center text-gray-800">
              {roomMsg}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full py-2 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-semibold"
        >
          Logout
        </button>
      </div>

      {notifyVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
            <h3 className="text-lg font-bold mb-3">Room Change Update</h3>
            <p className="mb-4 text-gray-800">{notifyText}</p>
            <button
              onClick={closeNotification}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
