import { useRef, useState, useEffect } from "react";
import { getTasks, deleteTask, updateTask, toggleComplete } from "../api.js";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from "recharts";

// ── Animated Card ──
const AnimatedCard = ({ children, className = "", delay = 0, darkMode }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const d = darkMode;
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: delay * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.25, ease: "easeOut" } }}
            className={`border rounded-2xl p-6 cursor-default ${className}
        ${d ? "bg-[#0f0f1c]/80 border-[#1e1e32] shadow-xl shadow-black/40"
                    : "bg-white/80 border-gray-200 shadow-xl shadow-gray-200/60"}`}
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
            {children}
        </motion.div>
    );
};

// ── Stat Card ──
const StatCard = ({ value, label, color, icon, delay, darkMode }) => (
    <AnimatedCard delay={delay} darkMode={darkMode}>
        <div className="flex justify-between items-start">
            <div>
                <motion.div
                    className="font-black tracking-wide leading-none text-5xl"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", color }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: delay * 0.1 + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >{value}</motion.div>
                <div className={`text-[11px] uppercase tracking-widest mt-2 ${darkMode ? "text-[#3a3a5a]" : "text-gray-400"}`}>{label}</div>
            </div>
            <div className="text-3xl opacity-25">{icon}</div>
        </div>
    </AnimatedCard>
);

// ── Chart Card ──
const ChartCard = ({ title, subtitle, children, delay, darkMode }) => (
    <AnimatedCard delay={delay} darkMode={darkMode}>
        <div className="mb-5">
            <div className="text-[10px] font-bold text-violet-500 tracking-widest uppercase mb-1">{subtitle}</div>
            <div className={`text-xl font-black tracking-widest ${darkMode ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{title}</div>
        </div>
        {children}
    </AnimatedCard>
);

// ── Tooltip ──
const CustomTooltip = ({ active, payload, label, darkMode }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={`border rounded-xl px-3 py-2 ${darkMode ? "bg-[#13131f] border-[#1e1e32]" : "bg-white border-gray-200 shadow-lg"}`}>
            {label && <div className={`text-[11px] mb-1 ${darkMode ? "text-[#5a5a80]" : "text-gray-400"}`}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} className="text-sm font-semibold" style={{ color: p.color || (darkMode ? "#e8e8f0" : "#111") }}>
                    {p.name}: {p.value}
                </div>
            ))}
        </div>
    );
};

// ── Legend ──
const LegendRow = ({ items }) => (
    <div className="flex justify-center gap-4 mt-3 flex-wrap">
        {items.map(({ label, color, count }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label} ({count})
            </div>
        ))}
    </div>
);

const COLORS = {
    high: "#ff6b6b", medium: "#ffbe32", low: "#32ffa0",
    student: "#a78bfa", employee: "#f472b6"
};
const PRIORITY_FILL = { high: "#ff6b6b", medium: "#ffbe32", low: "#32ffa0" };

// ── HERO SECTION ──
const HeroSection = ({ darkMode, total, completed, pending, completionRate }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);
    const d = darkMode;

    return (
        <div ref={ref} className="relative flex items-center justify-center"
            style={{ minHeight: "calc(100vh - 80px)" }}>
            <motion.div style={{ y, opacity, scale }} className="text-center w-full max-w-4xl mx-auto px-4">

                <motion.div className="inline-flex items-center gap-2 mb-8"
                    initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: "linear-gradient(135deg, #6c47ff, #ff47a3)" }}>⚡</div>
                    <span className={`text-sm font-medium tracking-wide ${d ? "text-[#5a5a80]" : "text-gray-500"}`}>
                        TaskFlow Smart Planner
                    </span>
                </motion.div>

                <div className="overflow-hidden">
                    <motion.h1 className={`leading-tight ${d ? "text-white" : "text-gray-900"}`}
                        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, letterSpacing: "-0.02em", fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
                        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}>
                        Visualize your tasks
                    </motion.h1>
                </div>

                <div className="overflow-hidden mb-6">
                    <motion.h1 className={`leading-tight ${d ? "text-white" : "text-gray-900"}`}
                        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, letterSpacing: "-0.02em", fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
                        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
                        with smart analytics.
                    </motion.h1>
                </div>

                <motion.p className={`text-base md:text-lg max-w-xl mx-auto mb-12 ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}>
                    Track progress, analyze priorities and stay ahead of every deadline.
                </motion.p>

                <motion.div className="flex items-center justify-center gap-3 flex-wrap"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}>
                    {[
                        { v: total, l: "Total", c: "#a78bfa" },
                        { v: completed, l: "Completed", c: "#32ffa0" },
                        { v: pending, l: "Pending", c: "#ffbe32" },
                        { v: `${completionRate}%`, l: "Done", c: "#f472b6" },
                    ].map((s, i) => (
                        <motion.div key={s.l}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border
                ${d ? "bg-[#0f0f1c]/80 border-[#1e1e32]" : "bg-white/80 border-gray-200 shadow-sm"}`}
                            style={{ backdropFilter: "blur(12px)" }}>
                            <span className="text-xl font-black"
                                style={{ fontFamily: "'Bebas Neue', sans-serif", color: s.c }}>{s.v}</span>
                            <span className={`text-xs uppercase tracking-widest ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>{s.l}</span>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div className="mt-16 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}>
                    <span className={`text-xs tracking-widest uppercase ${d ? "text-[#2a2a4a]" : "text-gray-300"}`}>
                        scroll to explore
                    </span>
                    <motion.div className="w-px h-8 rounded-full"
                        style={{ background: d ? "#2a2a4a" : "#d1d5db" }}
                        animate={{ scaleY: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                </motion.div>

            </motion.div>
        </div>
    );
};

// ── ZOOM-IN CHARTS SECTION ──
const ChartsSection = ({ darkMode, children }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "start start"]
    });

    const scaleVal = useTransform(scrollYProgress, [0, 1], [0.65, 0.98]);
    const opacityVal = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
    const yVal = useTransform(scrollYProgress, [0, 1], [80, 0]);
    const radiusVal = useTransform(scrollYProgress, [0, 1], [40, 16]);
    const d = darkMode;

    return (
        <div ref={ref} className="relative" style={{ minHeight: "200vh" }}>
            <div className="sticky top-24 flex justify-center">
                <motion.div
                    style={{
                        scale: scaleVal,
                        opacity: opacityVal,
                        y: yVal,
                        borderRadius: radiusVal,
                        transformOrigin: "center top",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        width: "98%",
                        background: d
                            ? "linear-gradient(135deg, rgba(12,12,28,0.97) 0%, rgba(18,10,35,0.97) 50%, rgba(12,12,28,0.97) 100%)"
                            : "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(245,240,255,0.97) 50%, rgba(255,255,255,0.97) 100%)",
                    }}
                    className={`overflow-hidden border-2
                        ${d
                            ? "border-violet-500/40 shadow-[0_0_60px_rgba(108,71,255,0.25),0_20px_60px_rgba(0,0,0,0.6)]"
                            : "border-violet-300/60 shadow-[0_0_60px_rgba(108,71,255,0.15),0_20px_40px_rgba(0,0,0,0.1)]"
                        }`}
                >
                    <div className="h-px w-full"
                        style={{ background: "linear-gradient(90deg, transparent, #6c47ff, #ff47a3, transparent)" }} />
                    <div className="p-8 md:p-12">{children}</div>
                    <div className="h-px w-full"
                        style={{ background: "linear-gradient(90deg, transparent, #ff47a3, #6c47ff, transparent)" }} />
                </motion.div>
            </div>
        </div>
    );
};

// ── TASK LIST SECTION ──
const TaskListSection = ({ darkMode, tasks, onRefresh }) => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [search, setSearch] = useState("all");
    const [searchInput, setSearchInput] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", priority: "medium", deadline: "", duration_minutes: "", user_type: "student", description: "" });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");
    const d = darkMode;

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const filtered = tasks.filter(t => {
        const matchStatus = statusFilter === "all" ? true : statusFilter === "completed" ? t.is_completed : !t.is_completed;
        const matchPriority = priorityFilter === "all" ? true : t.priority === priorityFilter;
        const matchSearch = search === "all" || t.title.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchPriority && matchSearch;
    });

    const handleToggle = async (id) => {
        try { await toggleComplete(id); onRefresh(); } catch { }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Permanently delete "${title}"?`)) return;
        try { await deleteTask(id); onRefresh(); } catch { }
    };

    const handleEditOpen = (task) => {
        setEditForm({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
            duration_minutes: task.duration_minutes,
            user_type: task.user_type,
        });
        setEditId(task.id);
        setEditError("");
        setEditSuccess("");
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        setEditError(""); setEditSuccess("");
        if (!editForm.title || !editForm.deadline) { setEditError("Title and deadline are required."); return; }
        try {
            setEditLoading(true);
            await updateTask(editId, {
                ...editForm,
                deadline: new Date(editForm.deadline).toISOString(),
                duration_minutes: parseInt(editForm.duration_minutes),
            });
            setEditSuccess("Task updated!");
            setTimeout(() => { setEditOpen(false); onRefresh(); }, 700);
        } catch { setEditError("Update failed. Try again."); }
        finally { setEditLoading(false); }
    };

    const fmt = (dt) => new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    const filterBtn = (active) =>
        `px-4 py-1.5 rounded-lg text-[11px] font-bold border transition-all
        ${active
            ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20"
            : d ? "border-[#1e1e32] text-[#4a4a6a] hover:bg-[#1e1e32]" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`;

    const priorityColor = (p) => p === "high" ? "#ff6b6b" : p === "medium" ? "#ffbe32" : "#32ffa0";

    return (
        <div className="px-4 md:px-8 pb-24 max-w-7xl mx-auto">

            {/* Section Header */}
            <motion.div className="mb-10 mt-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>
                <div className="text-[10px] font-bold text-violet-500 tracking-widest uppercase mb-2">Registry</div>
                <h2
                    className={`text-4xl md:text-5xl font-black tracking-widest ${d ? "text-white" : "text-gray-900"}`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    TASK INVENTORY
                </h2>
                <p className={`text-sm mt-2 ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>
                    All {tasks.length} tasks — manage, complete, and track every item.
                </p>
            </motion.div>

            {/* Summary Pills */}
            <motion.div
                className="flex flex-wrap gap-3 mb-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}>
                {[
                    { label: "Total", value: tasks.length, color: "#a78bfa" },
                    { label: "Completed", value: tasks.filter(t => t.is_completed).length, color: "#32ffa0" },
                    { label: "Pending", value: tasks.filter(t => !t.is_completed).length, color: "#ffbe32" },
                    { label: "High Priority", value: tasks.filter(t => t.priority === "high").length, color: "#ff6b6b" },
                ].map((s) => (
                    <div key={s.label}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm
                            ${d ? "bg-[#0f0f1c]/80 border-[#1e1e32]" : "bg-white/80 border-gray-200 shadow-sm"}`}
                        style={{ backdropFilter: "blur(12px)" }}>
                        <span className="font-black text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", color: s.color }}>{s.value}</span>
                        <span className={`text-xs uppercase tracking-widest ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>{s.label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Filter Bar */}
            <motion.div
                className={`flex flex-wrap gap-6 items-end p-5 rounded-2xl border mb-8
                    ${d ? "bg-[#0f0f1c]/80 border-[#1e1e32]" : "bg-white/80 border-gray-200 shadow-sm"}`}
                style={{ backdropFilter: "blur(12px)" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}>

                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                        Search
                    </label>
                    <input
                        placeholder="Search tasks..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                            ${d
                                ? "bg-[#1a1a2e] border-[#1e1e32] text-white placeholder-[#2a2a4a] focus:border-violet-500"
                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300 focus:border-violet-400"}`}
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                        Status
                    </label>
                    <div className="flex gap-2">
                        {["all", "pending", "completed"].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={filterBtn(statusFilter === s)}>
                                {s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Filter */}
                <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                        Priority
                    </label>
                    <div className="flex gap-2">
                        {["all", "high", "medium", "low"].map(p => (
                            <button key={p} onClick={() => setPriorityFilter(p)} className={filterBtn(priorityFilter === p)}>
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Task Grid */}
            {filtered.length === 0 ? (
                <motion.div
                    className={`text-center py-24 text-sm ${d ? "text-[#2a2a4a]" : "text-gray-300"}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    No tasks match your filters.
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((task, i) => (
                        <AnimatedCard
                            key={task.id}
                            delay={i % 6}
                            darkMode={d}
                            className={`relative overflow-hidden !p-0 ${task.is_completed ? "opacity-60" : ""}`}>

                            {/* Priority Accent Bar */}
                            <div
                                className="absolute top-0 left-0 w-1 h-full"
                                style={{ background: priorityColor(task.priority) }}
                            />

                            <div className="pl-5 pr-6 pt-5 pb-5">
                                {/* Top Row */}
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-tight border
                                        ${task.user_type === "student"
                                            ? "border-violet-300/50 text-violet-400 bg-violet-500/10"
                                            : d ? "border-[#1e1e32] text-[#5a5a80] bg-[#1a1a2e]" : "border-gray-200 text-gray-500 bg-gray-50"}`}>
                                        {task.user_type}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tight"
                                            style={{
                                                color: priorityColor(task.priority),
                                                background: `${priorityColor(task.priority)}15`,
                                            }}>
                                            {task.priority}
                                        </span>
                                        <span className={`text-[10px] font-bold ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                            {task.duration_minutes}m
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className={`text-base font-bold mb-2 leading-snug
                                    ${d ? "text-white" : "text-gray-900"}
                                    ${task.is_completed ? "line-through opacity-60" : ""}`}>
                                    {task.title}
                                </h3>

                                {/* Description */}
                                {task.description && (
                                    <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                        {task.description}
                                    </p>
                                )}

                                {/* Deadline */}
                                <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg mb-4
                                    ${d ? "bg-[#1a1a2e] text-[#4a4a6a]" : "bg-gray-50 text-gray-400"}`}>
                                    📅 {fmt(task.deadline)}
                                </div>

                                {/* Completion Progress Bar */}
                                <div className={`w-full h-0.5 rounded-full mb-4 ${d ? "bg-[#1e1e32]" : "bg-gray-100"}`}>
                                    <div
                                        className="h-0.5 rounded-full transition-all duration-500"
                                        style={{
                                            width: task.is_completed ? "100%" : "0%",
                                            background: "#32ffa0",
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggle(task.id)}
                                        className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                                            ${task.is_completed
                                                ? d ? "bg-[#1e1e32] text-[#3a3a5a] hover:bg-[#252540]" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                : "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20"}`}>
                                        {task.is_completed ? "↩ Reopen" : "✓ Complete"}
                                    </button>
                                    <button
                                        onClick={() => handleEditOpen(task)}
                                        className={`px-3 py-2 rounded-xl border text-sm transition-all
                                            ${d ? "border-[#1e1e32] text-[#4a4a6a] hover:bg-[#1e1e32] hover:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}>
                                        ✎
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id, task.title)}
                                        className="px-3 py-2 rounded-xl border border-rose-400/20 text-rose-400 hover:bg-rose-400/10 transition-all text-sm">
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </AnimatedCard>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[999] p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div
                        className={`border rounded-3xl p-8 w-full max-w-md shadow-2xl
                            ${d ? "bg-[#0d0d1a] border-[#1e1e32]" : "bg-white border-gray-200"}`}
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>

                        {/* Modal Header */}
                        <div className="mb-6">
                            <div className="text-[10px] font-bold text-violet-500 tracking-widest uppercase mb-1">Modify Record</div>
                            <h2 className={`text-3xl font-black tracking-widest ${d ? "text-white" : "text-gray-900"}`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EDIT TASK</h2>
                            <p className={`text-[11px] mt-1 ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>ID: {editId}</p>
                        </div>

                        <div className="space-y-4">
                            {editError && (
                                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm font-semibold text-rose-400">
                                    {editError}
                                </div>
                            )}
                            {editSuccess && (
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-400">
                                    {editSuccess}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                    Task Title
                                </label>
                                <input
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                                        ${d ? "bg-[#1a1a2e] border-[#1e1e32] text-white focus:border-violet-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={2}
                                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all resize-none
                                        ${d ? "bg-[#1a1a2e] border-[#1e1e32] text-white focus:border-violet-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Priority */}
                                <div>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                        Priority
                                    </label>
                                    <select
                                        value={editForm.priority}
                                        onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                                            ${d ? "bg-[#1a1a2e] border-[#1e1e32] text-white focus:border-violet-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                        Duration (mins)
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.duration_minutes}
                                        onChange={e => setEditForm({ ...editForm, duration_minutes: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                                            ${d ? "bg-[#1a1a2e] border-[#1e1e32] text-white focus:border-violet-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${d ? "text-[#3a3a5a]" : "text-gray-400"}`}>
                                    Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editForm.deadline}
                                    onChange={e => setEditForm({ ...editForm, deadline: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                                        ${d ? "bg-[#1a1a2e] border-[#1e1e32] text-white focus:border-violet-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                                        ${d ? "bg-[#1e1e32] text-[#4a4a6a] hover:bg-[#252540]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    disabled={editLoading}
                                    className="flex-[2] py-3 rounded-xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all disabled:opacity-60">
                                    {editLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

// ── MAIN DASHBOARD ──
export default function Dashboard({ darkMode }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const d = darkMode;

    const fetchTasks = async () => {
        try { const data = await getTasks(); setTasks(data.tasks || []); }
        catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, []);

    if (loading) return (
        <div className={`flex items-center justify-center h-64 text-sm ${d ? "text-[#2a2a4a]" : "text-gray-400"}`}>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                Loading dashboard...
            </motion.div>
        </div>
    );

    const total = tasks.length;
    const completed = tasks.filter(t => t.is_completed).length;
    const pending = tasks.filter(t => !t.is_completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityData = [
        { name: "High", value: tasks.filter(t => t.priority === "high").length },
        { name: "Medium", value: tasks.filter(t => t.priority === "medium").length },
        { name: "Low", value: tasks.filter(t => t.priority === "low").length },
    ].filter(d => d.value > 0);

    const userTypeData = [
        { name: "Student", value: tasks.filter(t => t.user_type === "student").length },
        { name: "Employee", value: tasks.filter(t => t.user_type === "employee").length },
    ].filter(d => d.value > 0);

    const statusData = [
        { name: "Completed", value: completed, fill: "#32ffa0" },
        { name: "Pending", value: pending, fill: "#ffbe32" },
    ];

    const deadlineMap = {};
    tasks.forEach(t => {
        const date = new Date(t.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        deadlineMap[date] = (deadlineMap[date] || 0) + 1;
    });
    const deadlineData = Object.entries(deadlineMap)
        .map(([date, count]) => ({ date, count }))
        .slice(0, 7);

    const durationData = tasks.slice(0, 6).map(t => ({
        name: t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title,
        minutes: t.duration_minutes,
        fill: PRIORITY_FILL[t.priority],
    }));

    const axisColor = d ? "#4a4a6a" : "#9ca3af";
    const gridColor = d ? "#1e1e32" : "#f0f0f0";

    return (
        <div>
            {/* HERO */}
            <HeroSection
                darkMode={d} total={total} completed={completed}
                pending={pending} completionRate={completionRate}
            />

            {/* ZOOM-IN CHARTS PANEL */}
            <ChartsSection darkMode={d}>
                <motion.div className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="text-[11px] font-bold text-violet-500 tracking-widest uppercase mb-2">CHARTS</div>
                    <h2 className={`text-3xl font-black tracking-widest ${d ? "text-white" : "text-gray-900"}`}
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}>DETAILED ANALYTICS</h2>
                    <p className={`text-sm mt-2 ${d ? "text-[#4a4a6a]" : "text-gray-400"}`}>
                        Deep dive into your task data
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard value={total} label="Total Tasks" color="#a78bfa" icon="📋" delay={0} darkMode={d} />
                    <StatCard value={completed} label="Completed" color="#32ffa0" icon="✅" delay={1} darkMode={d} />
                    <StatCard value={pending} label="Pending" color="#ffbe32" icon="⏳" delay={2} darkMode={d} />
                    <StatCard value={`${completionRate}%`} label="Completion Rate" color="#f472b6" icon="🎯" delay={3} darkMode={d} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <ChartCard title="BY PRIORITY" subtitle="Distribution" delay={4} darkMode={d}>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                                    {priorityData.map((e, i) => <Cell key={i} fill={COLORS[e.name.toLowerCase()]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip darkMode={d} />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <LegendRow items={priorityData.map(item => ({ label: item.name, color: COLORS[item.name.toLowerCase()], count: item.value }))} />
                    </ChartCard>

                    <ChartCard title="BY USER TYPE" subtitle="Distribution" delay={5} darkMode={d}>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={userTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                                    <Cell fill={COLORS.student} />
                                    <Cell fill={COLORS.employee} />
                                </Pie>
                                <Tooltip content={<CustomTooltip darkMode={d} />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <LegendRow items={userTypeData.map((item, i) => ({ label: item.name, color: i === 0 ? COLORS.student : COLORS.employee, count: item.value }))} />
                    </ChartCard>

                    <ChartCard title="COMPLETION STATUS" subtitle="Progress" delay={6} darkMode={d}>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={statusData} barSize={44}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip darkMode={d} />} cursor={{ fill: d ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChartCard title="TASKS BY DEADLINE" subtitle="Timeline" delay={7} darkMode={d}>
                        {deadlineData.length === 0
                            ? <div className={`text-center py-16 text-sm ${d ? "text-[#2a2a4a]" : "text-gray-300"}`}>No deadline data yet</div>
                            : <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={deadlineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip darkMode={d} />} />
                                    <Line type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 4 }} name="Tasks" />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                    </ChartCard>

                    <ChartCard title="TASK DURATION" subtitle="Minutes per task" delay={8} darkMode={d}>
                        {durationData.length === 0
                            ? <div className={`text-center py-16 text-sm ${d ? "text-[#2a2a4a]" : "text-gray-300"}`}>No tasks yet</div>
                            : <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={durationData} barSize={22} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                    <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
                                    <Tooltip content={<CustomTooltip darkMode={d} />} cursor={{ fill: d ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                                    <Bar dataKey="minutes" radius={[0, 6, 6, 0]} name="Minutes">
                                        {durationData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </ChartCard>
                </div>
            </ChartsSection>

            {/* ── TASK LIST BELOW CHARTS ── */}
            <TaskListSection darkMode={d} tasks={tasks} onRefresh={fetchTasks} />
        </div>
    );
}