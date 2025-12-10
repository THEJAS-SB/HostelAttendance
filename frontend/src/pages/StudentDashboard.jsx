import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "student") {
      navigate("/student-login");
      return;
    }
    loadUser();
  }, []);

  const getAuth = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const loadUser = async () => {
    const res = await axios.get(
      "https://hostelattendance-egok.onrender.com/api/me",
      getAuth()
    );
    setUser(res.data);
  };

  const mark = async (status) => {
    try {
      const res = await axios.post(
        "https://hostelattendance-egok.onrender.com/api/attendance/mark",
        { status },
        getAuth()
      );
      setMsg(res.data.status.toUpperCase());
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/student-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6 flex justify-center items-start">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl p-8 mt-6 flex flex-col">
        
        <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">
          TS Technovate Student Dashboard
        </h2>

        {user && (
          <div className="p-6 bg-blue-50 rounded-2xl shadow border border-blue-100 mb-6">
            <p className="text-2xl font-bold text-blue-700">{user.name}</p>
            <p className="text-gray-700 mt-1">🎓 Reg No: {user.regNo}</p>
            <p className="text-gray-700">🏛 Dept: {user.dept}</p>
            <p className="text-gray-700">🏠 Room No: {user.roomNo}</p>
          </div>
        )}

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
    </div>
  );
}
