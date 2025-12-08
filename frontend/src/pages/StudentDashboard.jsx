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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center p-6">

      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl border border-blue-100">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-extrabold text-blue-700">
            Student Dashboard
          </h2>

          <button
            onClick={() => setNotifyVisible(true)}
            className="relative p-3 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            🔔
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full mb-5 bg-gray-800 hover:bg-black text-white py-2 rounded-xl font-semibold shadow"
        >
          Logout
        </button>

        {user && (
          <div className="p-5 bg-blue-50 rounded-xl shadow-sm border border-blue-100 mb-5">
            <p className="text-xl font-bold text-blue-800">{user.name}</p>
            <p className="text-gray-700">🎓 Reg No: {user.regNo}</p>
            {/* 🔥 Dept Display Added */}
            <p className="text-gray-700">🏛️ Dept: {user.dept}</p>
            <p className="text-gray-700">🏠 Room No: {user.roomNo}</p>
          </div>
        )}

        {roomPending && (
          <p className="text-yellow-700 bg-yellow-100 p-3 rounded-xl text-center font-medium mb-4">
            Room change request pending → {pendingRoomTarget}
          </p>
        )}

        <div className="flex flex-col gap-4 mt-2">
          <button
            onClick={() => mark("present")}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl shadow text-white text-lg font-semibold transition"
          >
            Mark Present
          </button>

          <button
            onClick={() => mark("absent")}
            className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-xl shadow text-white text-lg font-semibold transition"
          >
            Mark Absent
          </button>
        </div>

        {msg && (
          <p className="mt-4 text-blue-700 bg-blue-100 p-3 rounded-xl text-center font-semibold">
            {msg}
          </p>
        )}

        <div className="mt-5 p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
          <p className="text-lg font-semibold mb-3 text-gray-800">Request Room Change</p>

          <input
            type="text"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="border p-3 rounded-xl w-full mb-3"
            placeholder="Enter new room number"
          />

          <button
            disabled={roomPending}
            onClick={sendRoomRequest}
            className={`w-full py-3 rounded-xl font-semibold shadow ${
              roomPending ? "bg-gray-300 cursor-not-allowed" : "bg-purple-600 text-white"
            }`}
          >
            {roomPending ? "Request Pending" : "Send Request"}
          </button>

          {roomMsg && (
            <p className="text-center mt-2 text-gray-700 font-medium">{roomMsg}</p>
          )}
        </div>
      </div>

      {notifyVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center border border-blue-100">
            <h3 className="text-xl font-bold mb-3 text-blue-800">Room Change Update</h3>
            <p className="text-gray-700 mb-4">{notifyText}</p>
            <button
              onClick={closeNotification}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
