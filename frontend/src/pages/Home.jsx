export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center items-center p-6">
      
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-xl text-center border border-blue-100">
        
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
          TS Technovate Attendance System
        </h1>
        <p className="text-gray-600 mb-8">
          Login as Student or Warden to continue
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          
          {/* Student Login */}
          <a
            href="/student-login"
            className="
flex items-center justify-center gap-3
bg-blue-600 
text-white 
py-3 rounded-xl 
shadow-lg shadow-blue-500/40 
hover:shadow-blue-500/60 
hover:bg-blue-700 
hover:scale-[1.04] 
active:scale-[0.97]
border border-blue-400/30
transition-all duration-300
"

          >
            <div className="p-2 rounded-md bg-white/20">🎓</div>
            <span className="text-lg font-semibold">Student Login</span>
          </a>

          {/* Warden Login */}
          <a
            href="/warden-login"
            className="
flex items-center justify-center gap-3
bg-green-600 
text-white 
py-3 rounded-xl 
shadow-lg shadow-green-500/40 
hover:shadow-green-500/60 
hover:bg-green-700 
hover:scale-[1.04] 
active:scale-[0.97]
border border-green-400/30
transition-all duration-300
"


          >
            <div className="p-2 rounded-md bg-white/20">🛂</div>
            <span className="text-lg font-semibold">Warden Login</span>
          </a>

        </div>
      </div>
    </div>
  );
}
