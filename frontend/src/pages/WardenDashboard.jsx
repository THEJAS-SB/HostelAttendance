import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function WardenDashboard() {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [pendingReq, setPendingReq] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef();
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "warden") {
      navigate("/warden-login");
      return;
    }
    fetchData();
    fetchRequests();

    const i1 = setInterval(fetchData, 10000);
    const i2 = setInterval(fetchRequests, 10000);

    return () => {
      clearInterval(i1);
      clearInterval(i2);
    };
  }, [date, search]);

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `https://hostelattendance-egok.onrender.com/api/admin/report?date=${date}`,
        getAuth()
      );

      const filtered = res.data.filter(
        (s) =>
          s.regNo.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.roomNo || "").toLowerCase().includes(search.toLowerCase()) ||
          (s.dept || "").toLowerCase().includes(search.toLowerCase())
      );

      setRecords(filtered);
      setMsg("");
    } catch (err) {
      setMsg("Failed to load attendance");
      setRecords([]);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "https://hostelattendance-egok.onrender.com/api/admin/room-requests",
        getAuth()
      );
      setPendingReq(res.data);
    } catch (err) {}
  };

  const acceptRequest = async (id) => {
    try {
      await axios.post(
        `https://hostelattendance-egok.onrender.com/api/admin/room-requests/${id}/approve`,
        {},
        getAuth()
      );
      fetchRequests();
      fetchData();
    } catch (err) {}
  };

  const rejectRequest = async (id) => {
    try {
      await axios.post(
        `https://hostelattendance-egok.onrender.com/api/admin/room-requests/${id}/reject`,
        {},
        getAuth()
      );
      fetchRequests();
      fetchData();
    } catch (err) {}
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pendingCount = pendingReq.length;

  const logout = () => {
    localStorage.clear();
    navigate("/warden-login");
  };

  const rooms = {};
  records.forEach((s) => {
    const room = s.roomNo || "No Room";
    if (!rooms[room]) {
      rooms[room] = { students: [], present: 0, absent: 0 };
    }
    rooms[room].students.push(s);
    if (s.status === "present") rooms[room].present++;
    else rooms[room].absent++;
  });

  const sortedRooms = Object.keys(rooms).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  // CSV Download Utils
  const downloadCSV = (rows, filename) => {
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  const downloadAttendanceCSV = () => {
    downloadCSV(
      [["Room No", "Reg No", "Name", "Dept", "Student Mobile", "Parent Mobile", "Status"]].concat(
        records.map((a) => [
          a.roomNo,
          a.regNo,
          a.name,
          a.dept,
          a.studentMobile,
          a.parentMobile,
          a.status === "not_responded_absent" ? "Auto-Absent" : a.status,
        ])
      ),
      `Attendance_${date}.csv`
    );
  };

  const downloadStudentListCSV = () => {
    downloadCSV(
      [["Room No", "Reg No", "Name", "Dept", "Student Mobile", "Parent Mobile"]].concat(
        records.map((a) => [
          a.roomNo,
          a.regNo,
          a.name,
          a.dept,
          a.studentMobile,
          a.parentMobile,
        ])
      ),
      `Student_List_${date}.csv`
    );
  };

  const downloadPresentCSV = () => {
    const list = records.filter((s) => s.status === "present");
    downloadCSV(
      [["Room No", "Reg No", "Name", "Dept", "Student Mobile", "Parent Mobile", "Status"]].concat(
        list.map((a) => [
          a.roomNo,
          a.regNo,
          a.name,
          a.dept,
          a.studentMobile,
          a.parentMobile,
          "Present",
        ])
      ),
      `Present_List_${date}.csv`
    );
  };

  const downloadAbsentCSV = () => {
    const list = records.filter(
      (s) => s.status === "absent" || s.status === "not_responded_absent"
    );
    downloadCSV(
      [["Room No", "Reg No", "Name", "Dept", "Student Mobile", "Parent Mobile", "Status"]].concat(
        list.map((a) => [
          a.roomNo,
          a.regNo,
          a.name,
          a.dept,
          a.studentMobile,
          a.parentMobile,
          a.status === "not_responded_absent" ? "Auto-Absent" : "Absent",
        ])
      ),
      `Absent_List_${date}.csv`
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-lg relative">

          {/* HEADER WITH LOGO + NOTIFICATION + LOGOUT */}
          <div className="flex justify-between items-center mb-10 px-2">
            <h1 className="text-3xl font-bold tracking-wide relative">
  <span className="text-blue-600 relative
    after:content-[''] after:absolute after:inset-0
    after:blur-2xl after:bg-blue-400/40 after:-z-10">
    TS Technovate
  </span>
  <span className="text-black ml-2">Warden Dashboard</span>
</h1>





            <div className="flex items-center gap-4" ref={notifRef}>
              {/* Notification Button */}
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-3 rounded-full bg-gray-100 hover:bg-gray-200
                           shadow hover:shadow-md transition-all"
              >
                🔔
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Logout Button Styled Like CSV Buttons */}
              <button
                onClick={logout}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold
                           shadow-md hover:shadow-lg hover:bg-red-700 
                           transition-all transform hover:-translate-y-1"
              >
                Logout
              </button>

              {/* Dropdown Notification Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-16 w-80 bg-white rounded-xl shadow-xl border p-4 z-50">
                  <h3 className="text-lg font-semibold mb-2">Room Change Requests</h3>

                  {pendingReq.length === 0 ? (
                    <p className="text-gray-500 text-sm">No requests</p>
                  ) : (
                    pendingReq.map((req) => (
                      <div key={req._id} className="p-3 border rounded-lg mb-2 bg-gray-50">
                        <div className="font-semibold">{req.name} ({req.regNo})</div>
                        <div className="text-sm text-gray-600">Dept: {req.dept}</div>
                        <div className="text-sm text-gray-600">
                          Room Change: {req.currentRoom} → {req.newRoom}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => acceptRequest(req._id)}
                            className="flex-1 bg-green-600 text-white py-1 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectRequest(req._id)}
                            className="flex-1 bg-red-600 text-white py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search + Date */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search Room, Name, Dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full py-3 px-4 border border-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500/40"

              />
            </div>

            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg py-2 px-3"
            />
          </div>

          {msg && <div className="text-red-600 text-center mb-3">{msg}</div>}

          {/* NEW DYNAMIC CSV UI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

            <button
              onClick={downloadAttendanceCSV}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold
                         shadow-md hover:shadow-lg hover:bg-blue-700 
                         transition-all duration-300 transform hover:-translate-y-1
                         flex items-center justify-center gap-3"
            >
              📋 Attendance CSV
            </button>

            <button
              onClick={downloadStudentListCSV}
              className="w-full py-4 rounded-xl bg-purple-600 text-white font-semibold
                         shadow-md hover:shadow-lg hover:bg-purple-700
                         transition-all duration-300 transform hover:-translate-y-1
                         flex items-center justify-center gap-3"
            >
              🧑‍🎓 Student List CSV
            </button>

            <button
              onClick={downloadPresentCSV}
              className="w-full py-4 rounded-xl bg-green-600 text-white font-semibold
                         shadow-md hover:shadow-lg hover:bg-green-700
                         transition-all duration-300 transform hover:-translate-y-1
                         flex items-center justify-center gap-3"
            >
              ✅ Present CSV
            </button>

            <button
              onClick={downloadAbsentCSV}
              className="w-full py-4 rounded-xl bg-red-600 text-white font-semibold
                         shadow-md hover:shadow-lg hover:bg-red-700
                         transition-all duration-300 transform hover:-translate-y-1
                         flex items-center justify-center gap-3"
            >
              ❌ Absent CSV
            </button>

          </div>

          {/* ROOMS */}
          {sortedRooms.map((room) => (
            <div key={room} className="bg-white border rounded-xl shadow-sm mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-3">
                  <img
                    src="/TS TECHNOVATE LOGO.png"
                    className="w-8 h-8 object-contain drop-shadow-lg"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Room {room}</div>
                    <div className="text-sm text-gray-500">{rooms[room].students.length} Members</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {rooms[room].present} / {rooms[room].students.length} Present
                </div>
              </div>

              <div className="p-4 space-y-3">
                {rooms[room].students.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-inner">
                    <div>
                      <div className="font-medium text-gray-800">{s.name}</div>
                      <div className="text-sm text-gray-500">{s.regNo}</div>
                      <div className="text-sm text-gray-500">{s.dept}</div>
                    </div>

                    {s.status === "present" && (
                      <div className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold">
                        Present
                      </div>
                    )}
                    {(s.status === "absent" || s.status === "not_responded_absent") && (
                      <div className="px-4 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-semibold">
                        {s.status === "not_responded_absent" ? "Auto-Absent" : "Absent"}
                      </div>
                    )}
                    {s.status === "pending" && (
                      <div className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-semibold">
                        Not Yet
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
