import { useState } from "react";
import { createTask } from "../api.js";

const INITIAL = { title: "", description: "", priority: "medium", duration_minutes: "", deadline: "", user_type: "student" };

export default function AddTask({ onSuccess, darkMode }) {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [focused, setFocused] = useState("");
    const d = darkMode;

    const set = (k, v) => setForm({ ...form, [k]: v });

    // --- Classic Theme Helpers ---
    const card = d
        ? "bg-[#1e293b] border-slate-700 shadow-2xl"
        : "bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

    const labelCls = `text-[10px] font-black uppercase tracking-[0.15em] mb-2 block ${d ? "text-slate-500" : "text-slate-400"}`;

    const inputCls = (name) => `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all border
    ${d ? "bg-slate-900 text-slate-100 placeholder-slate-600" : "bg-slate-50 text-slate-900 placeholder-slate-300"}
    ${focused === name
            ? "border-indigo-500 ring-4 ring-indigo-500/10"
            : d ? "border-slate-700" : "border-slate-200"}`;

    const handleSubmit = async () => {
        setError(""); setSuccess("");
        if (!form.title || !form.duration_minutes || !form.deadline) {
            setError("All marked fields (*) are required.");
            return;
        }
        try {
            setLoading(true);
            await createTask({
                ...form,
                deadline: new Date(form.deadline).toISOString(),
                duration_minutes: parseInt(form.duration_minutes)
            });
            setSuccess("Entry recorded. Organizing your schedule...");
            setForm(INITIAL);
            setTimeout(() => onSuccess(), 1200);
        } catch {
            setError("Network error. Please verify the connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4">
            {/* Page Header */}
            <div className="mb-10 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
                    <span className="text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase">Input Portal</span>
                </div>
                <h1 className={`text-4xl font-extrabold tracking-tight ${d ? "text-white" : "text-slate-900"}`}>
                    New <span className="text-indigo-600 font-light italic">Task</span>
                </h1>
                <p className={`text-sm mt-2 font-medium ${d ? "text-slate-400" : "text-slate-500"}`}>
                    Enter parameters for the optimization algorithm
                </p>
            </div>

            {/* Form Card */}
            <div className={`${card} border rounded-3xl p-8 md:p-10 transition-all`}>
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl px-4 py-3 text-xs font-bold mb-6 flex items-center gap-2">
                        <span className="text-base">⚠️</span> {error}
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl px-4 py-3 text-xs font-bold mb-6 flex items-center gap-2">
                        <span className="text-base">✓</span> {success}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className={labelCls}>Formal Title *</label>
                        <input className={inputCls("title")} placeholder="e.g., Financial Q3 Analysis" value={form.title}
                            onFocus={() => setFocused("title")} onBlur={() => setFocused("")} onChange={e => set("title", e.target.value)} />
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelCls}>Strategic Notes</label>
                        <textarea className={`${inputCls("desc")} resize-none h-24 pt-3`} placeholder="Contextual details for the task..."
                            value={form.description} onFocus={() => setFocused("desc")} onBlur={() => setFocused("")} onChange={e => set("description", e.target.value)} />
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Priority Rank *</label>
                            <select className={inputCls("priority")} value={form.priority} onFocus={() => setFocused("priority")} onBlur={() => setFocused("")} onChange={e => set("priority", e.target.value)}>
                                <option value="high">Critical (High)</option>
                                <option value="medium">Standard (Medium)</option>
                                <option value="low">Flexible (Low)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Classification *</label>
                            <select className={inputCls("user_type")} value={form.user_type} onFocus={() => setFocused("user_type")} onBlur={() => setFocused("")} onChange={e => set("user_type", e.target.value)}>
                                <option value="student">Academic / Student</option>
                                <option value="employee">Corporate / Employee</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Estimated Duration *</label>
                            <div className="relative">
                                <input className={inputCls("dur")} type="number" min="1" placeholder="e.g. 60" value={form.duration_minutes}
                                    onFocus={() => setFocused("dur")} onBlur={() => setFocused("")} onChange={e => set("duration_minutes", e.target.value)} />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Mins</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Final Deadline *</label>
                            <input className={inputCls("deadline")} type="datetime-local" value={form.deadline}
                                onFocus={() => setFocused("deadline")} onBlur={() => setFocused("")} onChange={e => set("deadline", e.target.value)} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button onClick={handleSubmit} disabled={loading}
                            className={`w-full py-4 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all shadow-lg 
                            ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98]"}`}>
                            {loading ? "Processing..." : "Commit Task"}
                        </button>
                    </div>
                </div>
            </div>

            <p className={`text-center mt-8 text-[10px] font-bold uppercase tracking-widest ${d ? "text-slate-600" : "text-slate-300"}`}>
                TaskFlow Secure Entry Node
            </p>
        </div>
    );
}