import { useState } from "react";
import { loginUser, registerUser } from "../api.js";

export default function AuthPage({ onLogin, darkMode }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [focused, setFocused] = useState("");
    const [showPass, setShowPass] = useState(false);

    const d = darkMode;
    const set = (k, v) => setForm({ ...form, [k]: v });

    const inputCls = (name) => `w-full rounded-xl px-4 py-3 text-sm outline-none transition border
    ${d ? "bg-[#13131f] text-white placeholder-[#3a3a5a]" : "bg-gray-50 text-gray-900 placeholder-gray-300"}
    ${focused === name ? "border-violet-500" : d ? "border-[#1e1e32]" : "border-gray-200"}`;

    const handleSubmit = async () => {
        setError(""); setSuccess("");
        if (!form.username || !form.password) { setError("Please fill in all required fields."); return; }

        if (mode === "register") {
            if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
            if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
            try {
                setLoading(true);
                await registerUser(form.username, form.email, form.password);
                setSuccess("Account created! Logging you in...");
                await loginUser(form.username, form.password);
                setTimeout(() => onLogin(form.username), 800);
            } catch (e) { setError(e.message); }
            finally { setLoading(false); }
        } else {
            try {
                setLoading(true);
                await loginUser(form.username, form.password);
                onLogin(form.username);
            } catch (e) { setError(e.message); }
            finally { setLoading(false); }
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#080810]" : "bg-gray-50"}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #6c47ff 0%, transparent 70%)" }} />
            </div>

            <div className="w-full max-w-md px-6 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                        style={{ background: "linear-gradient(135deg, #6c47ff, #ff47a3)" }}>⚡</div>
                    <div className="text-4xl font-black tracking-widest mb-1"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        TASKFLOW
                    </div>
                    <p className={`text-sm ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>Smart Schedule Planner</p>
                </div>

                <div className={`${d ? "bg-[#0f0f1c] border-[#1e1e32]" : "bg-white border-gray-200"} border rounded-2xl p-8`}>
                    <div className={`flex rounded-xl p-1 mb-7 ${d ? "bg-[#13131f]" : "bg-gray-100"}`}>
                        {["login", "register"].map(m => (
                            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                  ${mode === m ? "text-white shadow-sm" : (d ? "text-[#4a4a6a]" : "text-gray-400")}`}
                                style={mode === m ? { background: "linear-gradient(135deg, #6c47ff, #ff47a3)" } : {}}>
                                {m === "login" ? "🔑 Login" : "✦ Register"}
                            </button>
                        ))}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-black tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
                        </h2>
                        <p className={`text-xs mt-1 ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>
                            {mode === "login" ? "Login to access your tasks" : "Sign up to get started"}
                        </p>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}
                    {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm mb-5">{success}</div>}

                    <div className="flex flex-col gap-4">
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>Username *</div>
                            <input className={inputCls("username")} placeholder="e.g. arsha123" value={form.username}
                                onFocus={() => setFocused("username")} onBlur={() => setFocused("")}
                                onChange={e => set("username", e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                        </div>

                        {mode === "register" && (
                            <div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>Email</div>
                                <input className={inputCls("email")} type="email" placeholder="e.g. arsha@email.com" value={form.email}
                                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                                    onChange={e => set("email", e.target.value)} />
                            </div>
                        )}

                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>Password *</div>
                            <div className="relative">
                                <input className={inputCls("password")} type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={form.password}
                                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                                    onChange={e => set("password", e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                                <button onClick={() => setShowPass(!showPass)} type="button"
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>
                                    {showPass ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {mode === "register" && (
                            <div>
                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>Confirm Password *</div>
                                <input className={inputCls("confirm")} type={showPass ? "text" : "password"} placeholder="Re-enter password" value={form.confirm}
                                    onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")}
                                    onChange={e => set("confirm", e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                            </div>
                        )}

                        <button onClick={handleSubmit} disabled={loading}
                            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                            style={{ background: "linear-gradient(135deg, #6c47ff, #ff47a3)" }}>
                            {loading ? "Please wait..." : mode === "login" ? "🔑 Login" : "✦ Create Account"}
                        </button>
                    </div>

                    <p className={`text-center text-xs mt-5 ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>
                        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
                            className="text-violet-400 font-semibold hover:text-violet-300 transition">
                            {mode === "login" ? "Register here" : "Login here"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}