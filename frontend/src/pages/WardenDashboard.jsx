import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"

export default function WardenDashboard() {
  const [records, setRecords] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [search, setSearch] = useState("")
  const [pendingCount, setPendingCount] = useState(0)
  const [msg, setMsg] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const todayStr = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (!token || role !== "warden") {
      navigate("/warden-login")
      return
    }
    fetchData()
    fetchPending()
    const i1 = setInterval(fetchData, 10000)
    const i2 = setInterval(fetchPending, 10000)
    return () => {
      clearInterval(i1)
      clearInterval(i2)
    }
  }, [date, search])

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/report?date=${date}`,
        getAuth()
      )
      const filtered = res.data.filter(
        (s) =>
          s.regNo.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.roomNo || "").toLowerCase().includes(search.toLowerCase())
      )
      setRecords(filtered)
      setMsg("")
    } catch (err) {
      setMsg("Failed to load attendance")
      setRecords([])
    }
  }

  const fetchPending = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/room-requests?status=pending",
        getAuth()
      )
      setPendingCount(res.data.length)
    } catch (err) {}
  }

  const totalStudents = records.length
  const totalPresent = records.filter((r) => r.status === "present").length
  const totalAbsent = records.filter(
    (r) => r.status === "absent" || r.status === "not_responded_absent"
  ).length
  const totalNotYet = records.filter((r) => r.status === "pending").length

  const rooms = {}
  records.forEach((s) => {
    const room = s.roomNo || "No Room"
    if (!rooms[room]) {
      rooms[room] = { students: [], present: 0, absent: 0, notYet: 0 }
    }
    rooms[room].students.push(s)
    if (s.status === "present") rooms[room].present++
    else if (s.status === "absent" || s.status === "not_responded_absent") rooms[room].absent++
    else rooms[room].notYet++
  })
  const sortedRooms = Object.keys(rooms).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  )

  const downloadCSV = (rows, filename) => {
    const csv = rows.map((e) => e.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
  }

  const downloadAttendanceCSV = () => {
    downloadCSV(
      [["RegNo", "Name", "RoomNo", "Status"]].concat(
        records.map((a) => [a.regNo, a.name, a.roomNo, a.status])
      ),
      `Attendance_${date}.csv`
    )
  }

  const downloadStudentListCSV = () => {
    downloadCSV(
      [["RegNo", "Name", "RoomNo"]].concat(
        records.map((a) => [a.regNo, a.name, a.roomNo])
      ),
      `Student_List_${date}.csv`
    )
  }

  const downloadPresentCSV = () => {
    const list = records.filter((s) => s.status === "present")
    downloadCSV(
      [["RegNo", "Name", "RoomNo", "Status"]].concat(
        list.map((a) => [a.regNo, a.name, a.roomNo, "Present"])
      ),
      `Present_List_${date}.csv`
    )
  }

  const downloadAbsentCSV = () => {
    const list = records.filter(
      (s) => s.status === "absent" || s.status === "not_responded_absent"
    )
    downloadCSV(
      [["RegNo", "Name", "RoomNo", "Status"]].concat(
        list.map((a) => [
          a.regNo,
          a.name,
          a.roomNo,
          a.status === "not_responded_absent" ? "Auto-Absent" : "Absent"
        ])
      ),
      `Absent_List_${date}.csv`
    )
  }

  const logout = () => {
    localStorage.clear()
    navigate("/warden-login")
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Warden Dashboard</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/warden-dashboard")}
              className={
                location.pathname === "/warden-dashboard"
                  ? "px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white"
                  : "px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700"
              }
            >
              Attendance
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className={
                location.pathname === "/notifications"
                  ? "px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white relative"
                  : "px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 relative"
              }
            >
              Notifications
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700 font-semibold">
            Total Students: {totalStudents}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Name / Reg / Room"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-semibold">
            Present: {totalPresent}
          </div>
          <div className="bg-red-100 text-red-800 p-3 rounded-lg text-center font-semibold">
            Absent: {totalAbsent}
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-center font-semibold">
            Not Yet: {totalNotYet}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={downloadAttendanceCSV}
            className="bg-blue-600 text-white py-2 rounded"
          >
            Attendance CSV
          </button>
          <button
            onClick={downloadStudentListCSV}
            className="bg-purple-600 text-white py-2 rounded"
          >
            Student List CSV
          </button>
          <button
            onClick={downloadPresentCSV}
            className="bg-green-600 text-white py-2 rounded"
          >
            Present CSV
          </button>
          <button
            onClick={downloadAbsentCSV}
            className="bg-red-600 text-white py-2 rounded"
          >
            Absent CSV
          </button>
        </div>

        {msg && <p className="text-red-600 text-center mb-3">{msg}</p>}

        {sortedRooms.map((room) => (
          <div key={room} className="bg-gray-50 p-4 rounded-xl mb-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-bold text-blue-600">Room {room}</h3>
              <span className="text-sm text-gray-700">
                Total: {rooms[room].students.length} • Present:{" "}
                {rooms[room].present} • Absent: {rooms[room].absent} • Not Yet:{" "}
                {rooms[room].notYet}
              </span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {rooms[room].students.map((s, i) => (
                  <tr
                    key={i}
                    className={`border-b ${
                      s.status === "pending" ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="py-1">{s.regNo}</td>
                    <td className="py-1">{s.name}</td>
                    <td className="py-1 font-semibold">
                      {s.status === "present" && (
                        <span className="text-green-600">Present</span>
                      )}
                      {s.status === "absent" && (
                        <span className="text-red-600">Absent</span>
                      )}
                      {s.status === "not_responded_absent" && (
                        <span className="text-red-600">Auto-Absent</span>
                      )}
                      {s.status === "pending" && (
                        <span className="text-yellow-600">Not Yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <button
          onClick={logout}
          className="w-full bg-red-600 text-white py-3 rounded-xl mt-4 font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
