import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [roomMsg, setRoomMsg] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [roomPending, setRoomPending] = useState(false);
  const [pendingRoomTarget, setPendingRoomTarget] = useState("");

  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyText, setNotifyText] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "student") {
      navigate("/student-login");
      return;
    }
    loadUser();
    loadRoomPending();
    loadNotification();
  }, []);

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const loadUser = async () => {
    const res = await axios.get("http://localhost:5000/api/me", getAuth());
    setUser(res.data);
  };

  const loadRoomPending = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/student/room-change-status",
      getAuth()
    );
    setRoomPending(res.data.pending);
    setPendingRoomTarget(res.data.newRoom || "");
  };

  const loadNotification = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/student/room-change-notification",
      getAuth()
    );
    if (res.data.hasNotification) {
      setNotificationCount(1);
      if (res.data.status === "approved") {
        setNotifyText("Your room change to " + res.data.newRoom + " has been Approved");
      } else {
        setNotifyText("Your room change request has been Rejected");
      }
    }
  };

  const closeNotification = async () => {
    await axios.post(
      "http://localhost:5000/api/student/room-change-notification/clear",
      {},
      getAuth()
    );
    setNotificationCount(0);
    setNotifyVisible(false);
    loadUser();
    loadRoomPending();
  };

  const mark = async (status) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        { status },
        getAuth()
      );
      setMsg(res.data.status.toUpperCase());
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  const sendRoomRequest = async () => {
    setRoomMsg("");
    if (!newRoom.trim()) {
      setRoomMsg("Enter new room number");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/student/room-change-request",
        { newRoom },
        getAuth()
      );
      setRoomMsg("Request sent to warden");
      setNewRoom("");
      loadRoomPending();
    } catch (err) {
      setRoomMsg(err.response?.data?.message || "Failed to send request");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/student-login");
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6 flex justify-center items-start">

    <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl p-8 mt-6 flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-wide">
          <span className="text-blue-700">TS Technovate</span>
          <span className="ml-2 text-gray-800">Student Dashboard</span>
        </h2>

        {/* Notification Bell */}
        <button
          onClick={() => setNotifyVisible(true)}
          className="relative p-3 bg-blue-50 hover:bg-blue-100 rounded-full shadow transition-all"
        >
          🔔
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* User Card */}
      {user && (
        <div className="p-6 bg-blue-50 rounded-2xl shadow border border-blue-100 mb-6">
          <p className="text-2xl font-bold text-blue-700">{user.name}</p>
          <p className="text-gray-700 mt-1">🎓 Reg No: {user.regNo}</p>
          <p className="text-gray-700">🏛 Dept: {user.dept}</p>
          <p className="text-gray-700">🏠 Room No: {user.roomNo}</p>
        </div>
      )}

      {/* Room Pending */}
      {roomPending && (
        <p className="text-yellow-800 bg-yellow-100 p-3 rounded-xl text-center font-medium mb-5 shadow">
          Room change request pending → {pendingRoomTarget}
        </p>
      )}

      {/* Attendance Buttons */}
      <div className="flex flex-col gap-4 mb-5">
        <button
          onClick={() => mark("present")}
          className="w-full py-3 rounded-2xl font-semibold text-white text-lg
          bg-gradient-to-r from-green-500 to-green-600
          shadow-lg shadow-green-500/30
          hover:scale-[1.03] hover:shadow-green-500/50
          active:scale-[0.98] transition-all duration-300"
        >
          Mark Present
        </button>

        <button
          onClick={() => mark("absent")}
          className="w-full py-3 rounded-2xl font-semibold text-white text-lg
          bg-gradient-to-r from-red-500 to-red-600
          shadow-lg shadow-red-500/30
          hover:scale-[1.03] hover:shadow-red-500/50
          active:scale-[0.98] transition-all duration-300"
        >
          Mark Absent
        </button>
      </div>

      {msg && (
        <p className="text-blue-700 bg-blue-100 p-3 rounded-xl text-center font-semibold shadow mb-5">
          {msg}
        </p>
      )}

      {/* Room Change Request */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow mb-6">
        <p className="text-lg font-semibold text-gray-800 mb-4">Request Room Change</p>

        <input
          type="number"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 shadow-sm mb-3"
          placeholder="Enter new room number"
        />

        <button
          disabled={roomPending}
          onClick={sendRoomRequest}
          className={`w-full py-3 rounded-2xl font-semibold shadow-lg 
            ${
              roomPending
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            }`}
        >
          {roomPending ? "Request Pending" : "Send Request"}
        </button>

        {roomMsg && (
          <p className="text-center mt-3 text-gray-700 font-medium">{roomMsg}</p>
        )}
      </div>

      {/* LOGOUT BUTTON AT BOTTOM */}
      <button
        onClick={logout}
        className="mt-auto w-full py-3 rounded-2xl font-semibold
        bg-gradient-to-r from-gray-900 to-gray-800 
        text-white shadow-lg shadow-gray-900/40
        hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-300"
      >
        Logout
      </button>

    </div>

    {/* Notification Popup */}
    {notifyVisible && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center border border-blue-100">
          <h3 className="text-xl font-bold mb-3 text-blue-800">Room Change Update</h3>
          <p className="text-gray-700 mb-4">{notifyText}</p>

          <button
            onClick={closeNotification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl shadow"
          >
            OK
          </button>
        </div>
      </div>
    )}
  </div>
);

}
