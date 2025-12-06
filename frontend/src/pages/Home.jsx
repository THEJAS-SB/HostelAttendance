export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-blue-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Hostel Attendance</h1>
      <div className="flex gap-4">
        <a
          href="/student-login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Student Login
        </a>
        <a
          href="/warden-login"
          className="px-6 py-3 bg-green-600 text-white rounded-lg"
        >
          Warden Login
        </a>
      </div>
    </div>
  )
}
