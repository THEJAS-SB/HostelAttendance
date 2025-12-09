import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"

export default function Notifications() {
  const [requests, setRequests] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (!token || role !== "warden") {
      navigate("/warden-login")
      return
    }
    fetchRequests()
    const interval = setInterval(fetchRequests, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "https://hostelattendance-egok.onrender.com/api/admin/room-requests?status=pending",
        getAuth()
      )
      setRequests(res.data)
    } catch (err) {}
  }

  const approve = async (id) => {
    await axios.post(
      `https://hostelattendance-egok.onrender.com/api/admin/room-requests/${id}/approve`,
      {},
      getAuth()
    )
    fetchRequests()
  }

  const reject = async (id) => {
    await axios.post(
      `https://hostelattendance-egok.onrender.com/api/admin/room-requests/${id}/reject`,
      {},
      getAuth()
    )
    fetchRequests()
  }

  const logout = () => {
    localStorage.clear()
    navigate("/warden-login")
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-lg">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Notifications</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/warden-dashboard")}
              className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700"
            >
              Attendance
            </button>
            <button className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white">
              Notifications
            </button>
          </div>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-semibold text-lg">
            No Notifications
          </div>
        )}

        {requests.length > 0 && (
          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-200 text-center font-semibold">
                <th className="p-2">Reg No</th>
                <th className="p-2">Name</th>
                <th className="p-2">Dept</th>
                <th className="p-2">Current Room</th>
                <th className="p-2">Requested Room</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="text-center border-t">
                  <td className="p-2">{r.regNo}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.dept}</td>
                  <td className="p-2">{r.currentRoom}</td>
                  <td className="p-2">{r.newRoom}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => approve(r._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(r._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          className="w-full bg-red-600 text-white py-3 rounded-xl mt-6 font-semibold"
          onClick={logout}
        >
          Logout
        </button>

      </div>
    </div>
  )
}
