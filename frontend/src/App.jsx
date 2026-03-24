import { useState } from "react";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";
import Schedule from "./components/Schedule";
import Dashboard from "./components/Dashboard";
import AuthPage from "./components/AuthPage";
import ParticleBackground from "./components/ParticleBackground";
import { getAccessToken, logoutUser } from "./api.js";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [refresh, setRefresh] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAccessToken());
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const triggerRefresh = () => setRefresh((r) => !r);
  const handleLogin = (uname) => { setUsername(uname); setIsLoggedIn(true); };
  const handleLogout = () => { logoutUser(); setIsLoggedIn(false); setUsername(""); setActivePage("dashboard"); };

  if (!isLoggedIn) return (
    <div className="relative">
      <ParticleBackground darkMode={darkMode} />
      <div className="relative z-10">
        <AuthPage onLogin={handleLogin} darkMode={darkMode} />
      </div>
    </div>
  );

  const d = darkMode;

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "tasks", label: "All Tasks" },
    { key: "add", label: "Add Task" },
    { key: "schedule", label: "Schedule" },
  ];

  return (
    <div className={`min-h-screen relative ${d ? "bg-[#080810] text-white" : "bg-gray-100 text-gray-900"}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* PARTICLES */}
      <ParticleBackground darkMode={d} />

      {/* FLOATING PILL NAVBAR */}
      <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
        <nav className={`flex items-center gap-1 px-2 py-2 rounded-full shadow-2xl border relative z-50
          ${d ? "bg-[#0f0f1c]/90 border-[#1e1e32] shadow-black/60" : "bg-white/90 border-gray-200 shadow-gray-300/60"}`}
          style={{ backdropFilter: "blur(16px)" }}>

          {/* Brand icon */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0 mr-1"
            style={{ background: "linear-gradient(135deg, #6c47ff, #ff47a3)" }}>⚡</div>

          {/* Nav links */}
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActivePage(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${activePage === item.key
                  ? "text-white"
                  : d ? "text-[#5a5a80] hover:text-[#9090b0]" : "text-gray-400 hover:text-gray-600"}`}
              style={activePage === item.key ? { background: "linear-gradient(135deg, #6c47ff, #ff47a3)" } : {}}>
              {item.label}
            </button>
          ))}

          {/* Divider */}
          <div className={`w-px h-5 mx-1 ${d ? "bg-[#1e1e32]" : "bg-gray-200"}`} />

          {/* Dark/Light toggle */}
          <button onClick={() => setDarkMode(!d)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all border
              ${d ? "border-[#1e1e32] text-[#5a5a80] hover:border-violet-500/50 hover:text-violet-400"
                : "border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500"}`}>
            {d ? "🌙" : "☀️"}
          </button>

          {/* User pill */}
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all ml-1
                ${d ? "border-[#1e1e32] hover:border-violet-500/40" : "border-gray-200 hover:border-violet-300"}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6c47ff, #ff47a3)" }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span className={`text-sm font-medium ${d ? "text-white" : "text-gray-900"}`}>{username}</span>
              <span className={`text-[10px] ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>▾</span>
            </button>

            {showUserMenu && <div onClick={() => setShowUserMenu(false)} className="fixed inset-0 z-40" />}
            {showUserMenu && (
              <div className={`absolute right-0 top-12 rounded-2xl border shadow-2xl z-50 overflow-hidden min-w-[160px]
                ${d ? "bg-[#0f0f1c]/95 border-[#1e1e32] shadow-black/60" : "bg-white/95 border-gray-200 shadow-gray-200/80"}`}
                style={{ backdropFilter: "blur(16px)" }}>
                <div className={`px-4 py-3 border-b ${d ? "border-[#1e1e32]" : "border-gray-100"}`}>
                  <div className={`text-xs font-semibold ${d ? "text-white" : "text-gray-900"}`}>{username}</div>
                  <div className={`text-[10px] ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>Logged in ✅</div>
                </div>
                <div className="p-2">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition text-left">
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-10">
        {activePage === "dashboard" && <Dashboard darkMode={d} />}
        {activePage === "tasks" && <TaskList refresh={refresh} triggerRefresh={triggerRefresh} darkMode={d} />}
        {activePage === "add" && <AddTask onSuccess={() => { triggerRefresh(); setActivePage("tasks"); }} darkMode={d} />}
        {activePage === "schedule" && <Schedule darkMode={d} />}
      </main>
    </div>
  );
}