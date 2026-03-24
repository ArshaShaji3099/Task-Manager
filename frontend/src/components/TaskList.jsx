import { useState, useEffect } from "react";
import { getTasks, deleteTask, updateTask, toggleComplete } from "../api.js";
import AlertBanner from "./AlertBanner.jsx";

const EMPTY_FORM = { title: "", description: "", priority: "medium", duration_minutes: "", deadline: "", user_type: "student" };

export default function TaskList({ refresh, triggerRefresh, darkMode }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userFilter, setUserFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editSuccess, setEditSuccess] = useState("");
    const [editError, setEditError] = useState("");
    const [focused, setFocused] = useState("");

    const d = darkMode;

    // --- Classic Theme Helpers ---
    const card = d ? "bg-[#1e293b] border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm";
    const titleText = d ? "text-slate-100" : "text-slate-900";
    const labelCls = `text-[10px] font-black uppercase tracking-[0.15em] mb-2 block ${d ? "text-slate-500" : "text-slate-400"}`;

    const inputCls = (name) => `w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all border
    ${d ? "bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-600" : "bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-300"}
    ${focused === name ? "border-indigo-500 ring-4 ring-indigo-500/10" : ""}`;

    const filterBtn = (active) => `px-4 py-1.5 rounded-lg text-[11px] font-bold border transition-all
    ${active
            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
            : d ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`;

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getTasks(userFilter === "all" ? "" : userFilter, search, priorityFilter === "all" ? "" : priorityFilter);
                setTasks(data.tasks || []);
            } catch { setError("Synchronization failed. Check backend status."); }
            finally { setLoading(false); }
        })();
    }, [refresh, userFilter, priorityFilter, search]);

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 500);
        return () => clearTimeout(t);
    }, [searchInput]);

    const handleToggleComplete = async (id) => {
        try { await toggleComplete(id); triggerRefresh(); } catch { setError("Update failed."); }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Permanently delete "${title}"?`)) return;
        try { await deleteTask(id); triggerRefresh(); } catch { setError("Delete failed."); }
    };

    const handleEditOpen = (task) => {
        setEditForm({ title: task.title, description: task.description || "", priority: task.priority, duration_minutes: task.duration_minutes, deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "", user_type: task.user_type });
        setEditId(task.id); setEditError(""); setEditSuccess(""); setEditOpen(true);
    };

    const handleEditSave = async () => {
        setEditError(""); setEditSuccess("");
        if (!editForm.title || !editForm.duration_minutes || !editForm.deadline) { setEditError("Required fields missing."); return; }
        try {
            setEditLoading(true);
            await updateTask(editId, { ...editForm, deadline: new Date(editForm.deadline).toISOString(), duration_minutes: parseInt(editForm.duration_minutes) });
            setEditSuccess("Update successful.");
            setTimeout(() => { setEditOpen(false); triggerRefresh(); }, 700);
        } catch { setEditError("Update failed."); }
        finally { setEditLoading(false); }
    };

    const fmt = (dt) => new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    const filtered = tasks.filter(t =>
        statusFilter === "completed" ? t.is_completed :
            statusFilter === "pending" ? !t.is_completed : true
    );

    return (
        <div className="max-w-7xl mx-auto p-4 transition-colors">
            {/* Page Header */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-10 bg-indigo-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Central Registry</span>
                </div>
                <h1 className={`text-5xl font-extrabold tracking-tight ${titleText}`}>
                    Task <span className="text-indigo-600 font-light italic">Inventory</span>
                </h1>
            </div>

            {error && (
                <div className="mb-6 rounded-xl p-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200">
                    {error}
                </div>
            )}

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { v: tasks.length, l: "TOTAL RECORDED", c: "text-indigo-600", bg: "bg-indigo-500/5" },
                    { v: tasks.filter(t => t.is_completed).length, l: "COMPLETED", c: "text-emerald-600", bg: "bg-emerald-500/5" },
                    { v: tasks.filter(t => !t.is_completed).length, l: "PENDING", c: "text-rose-600", bg: "bg-rose-500/5" }
                ].map(s => (
                    <div key={s.l} className={`${card} border rounded-2xl p-6 ${s.bg}`}>
                        <div className={`text-4xl font-black mb-1 ${s.c}`}>{s.v}</div>
                        <div className={labelCls}>{s.l}</div>
                    </div>
                ))}
            </div>

            <AlertBanner tasks={tasks} darkMode={darkMode} />

            {/* Filter Suite */}
            <div className={`${card} border rounded-2xl p-6 mb-8 flex flex-wrap gap-8 items-end`}>
                <div className="flex-1 min-w-[240px]">
                    <label className={labelCls}>Global Search</label>
                    <input className={inputCls("search")} placeholder="Search tasks..." value={searchInput}
                        onFocus={() => setFocused("search")} onBlur={() => setFocused("")} onChange={e => setSearchInput(e.target.value)} />
                </div>

                {[
                    { label: "Classification", state: userFilter, set: setUserFilter, opts: ["all", "student", "employee"] },
                    { label: "Priority", state: priorityFilter, set: setPriorityFilter, opts: ["all", "high", "medium", "low"] },
                    { label: "Status", state: statusFilter, set: setStatusFilter, opts: ["all", "pending", "completed"] }
                ].map(f => (
                    <div key={f.label}>
                        <label className={labelCls}>{f.label}</label>
                        <div className="flex gap-2">
                            {f.opts.map(o => (
                                <button key={o} onClick={() => f.set(o)} className={filterBtn(f.state === o)}>
                                    {o.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Grid */}
            {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Database...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {filtered.map(task => (
                        <div key={task.id} className={`${card} border rounded-2xl p-6 group transition-all hover:scale-[1.01] hover:shadow-2xl relative overflow-hidden ${task.is_completed ? 'opacity-60' : ''}`}>

                            {/* Priority Accent Line */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${task.priority === 'high' ? 'bg-rose-500' :
                                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />

                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter border ${task.user_type === 'student' ? 'border-indigo-200 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 bg-slate-50'
                                    }`}>
                                    {task.user_type}
                                </span>
                                <span className={`text-[10px] font-bold ${d ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {task.duration_minutes} MINS
                                </span>
                            </div>

                            <h3 className={`text-lg font-bold mb-2 leading-tight ${titleText} ${task.is_completed ? 'line-through' : ''}`}>
                                {task.title}
                            </h3>

                            {task.description && (
                                <p className={`text-xs mb-4 line-clamp-2 ${d ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {task.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 mb-6 text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <span>📅</span> {fmt(task.deadline)}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => handleToggleComplete(task.id)}
                                    className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${task.is_completed
                                            ? 'bg-slate-200 text-slate-500'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}>
                                    {task.is_completed ? "Reopen" : "Complete"}
                                </button>
                                <button onClick={() => handleEditOpen(task)} className={`px-4 py-2 rounded-xl border transition-all ${d ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                    ✎
                                </button>
                                <button onClick={() => handleDelete(task.id, task.title)} className="px-4 py-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all">
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Refined Edit Modal */}
            {editOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div className={`${card} border rounded-3xl p-8 w-full max-w-lg`}>
                        <div className="mb-6">
                            <h2 className={`text-2xl font-black tracking-tight ${titleText}`}>Modify Record</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {editId}</p>
                        </div>

                        <div className="space-y-4">
                            {editError && (
                                <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
                                    {editError}
                                </div>
                            )}
                            {editSuccess && (
                                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
                                    {editSuccess}
                                </div>
                            )}
                            <div>
                                <label className={labelCls}>Task Title</label>
                                <input className={inputCls("title")} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Priority</label>
                                    <select className={inputCls("p")} value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Deadline</label>
                                    <input className={inputCls("d")} type="datetime-local" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setEditOpen(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest ${d ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
                                <button onClick={handleEditSave} disabled={editLoading} className="flex-[2] py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                    {editLoading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}