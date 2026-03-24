import { useState, useEffect } from "react";
import { getSchedule } from "../api.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Schedule({ darkMode }) {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [exporting, setExporting] = useState(false);
    const d = darkMode;

    useEffect(() => {
        (async () => {
            try {
                setLoading(true); setError("");
                const data = await getSchedule(filter === "all" ? "" : filter);
                setSchedule(data);
            } catch {
                setError("No tasks found. Please add tasks first!");
                setSchedule(null);
            } finally { setLoading(false); }
        })();
    }, [filter]);

    const formatTime = (dt) => new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const formatDate = (dt) => new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const formatFull = (dt) => new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const handleExportPDF = () => {
        if (!schedule?.scheduled_tasks?.length) return;
        setExporting(true);
        try {
            const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

            // PDF Header - Classic Slate Style
            doc.setFillColor(30, 41, 59); // Slate-800
            doc.rect(0, 0, 297, 40, "F");

            doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(255, 255, 255);
            doc.text("TASKFLOW REPORT", 14, 20);

            doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(200, 200, 200);
            doc.text(`Generated: ${new Date().toLocaleString("en-IN")}  |  Filter: ${filter.toUpperCase()}`, 14, 30);

            const tableData = schedule.scheduled_tasks.map((task, i) => [
                i + 1, task.title,
                `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`,
                formatDate(task.start_time), task.priority.toUpperCase(),
                `${task.duration_minutes}m`, formatFull(task.deadline),
                task.status === "at_risk" ? "AT RISK" : "ON TRACK",
            ]);

            autoTable(doc, {
                startY: 50,
                head: [["#", "Task Description", "Schedule", "Date", "Priority", "Dur.", "Deadline", "Status"]],
                body: tableData,
                theme: "striped",
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
                styles: { fontSize: 8, cellPadding: 4 },
                columnStyles: {
                    7: { fontStyle: 'bold' }
                },
                didParseCell: (data) => {
                    if (data.section === "body" && data.column.index === 7) {
                        data.cell.styles.textColor = data.row.raw[7] === "AT RISK" ? [220, 38, 38] : [5, 150, 105];
                    }
                }
            });

            doc.save(`TaskFlow-Schedule-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) { console.error("PDF export failed:", err); }
        finally { setExporting(false); }
    };

    // ── Classic Aesthetic Theme Helpers ──
    const card = d
        ? "bg-[#1e293b] border-slate-700 shadow-xl"
        : "bg-white border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]";

    const titleText = d ? "text-slate-100" : "text-slate-900";
    const subText = d ? "text-slate-400" : "text-slate-500";
    const statLabel = d ? "text-slate-500" : "text-slate-400 font-bold tracking-tight";
    const divider = d ? "bg-slate-700" : "bg-slate-100";

    const PRIORITY_BADGE = {
        high: d ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-600 border-rose-100",
        medium: d ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-100",
        low: d ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-100",
    };

    return (
        <div className="max-w-6xl mx-auto p-6 transition-colors duration-300">
            {/* Header Area */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-10 bg-indigo-600 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Optimization Engine</span>
                    </div>
                    <h1 className={`text-5xl font-extrabold tracking-tight leading-none ${titleText}`}>
                        Smart <span className="text-indigo-600 font-light italic">Schedule</span>
                    </h1>
                    <p className={`text-sm mt-3 ${subText}`}>Standard Greedy Algorithm • High Priority & Earliest Deadline</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className={`flex p-1 rounded-xl border ${d ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        {["all", "student", "employee"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${filter === f
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600'
                                    : 'text-slate-400 hover:text-slate-600'}`}>
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleExportPDF}
                        disabled={exporting || !schedule?.scheduled_tasks?.length}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all bg-slate-900 dark:bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-40">
                        {exporting ? "..." : "Export PDF"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-6 py-4 text-sm mb-8 animate-pulse">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-32 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className={`mt-4 text-sm font-medium ${subText}`}>Calculating optimal time slots...</p>
                </div>
            ) : schedule ? (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { v: schedule.total_tasks, l: "TOTAL TASKS", c: "text-indigo-600" },
                            { v: schedule.total_tasks - schedule.at_risk_count, l: "ON TRACK", c: "text-emerald-600" },
                            { v: schedule.at_risk_count, l: "AT RISK", c: "text-rose-600" },
                        ].map(s => (
                            <div key={s.l} className={`${card} border rounded-3xl p-7 transition-transform hover:scale-[1.02]`}>
                                <div className={`text-4xl font-black mb-1 ${s.c}`}>{s.v}</div>
                                <div className={`text-[10px] tracking-widest ${statLabel}`}>{s.l}</div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        {schedule.scheduled_tasks.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className={subText}>No tasks found for this view.</p>
                            </div>
                        ) : (
                            schedule.scheduled_tasks.map((task, idx) => (
                                <div key={task.id} className={`${card} border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-8 group`}>

                                    {/* Column 1: Time Slot */}
                                    <div className="flex md:flex-col items-center justify-center md:border-r border-slate-100 dark:border-slate-700 pr-8 min-w-[140px]">
                                        <div className="text-2xl font-black text-indigo-600">{formatTime(task.start_time).split(' ')[0]}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                            {formatTime(task.start_time).split(' ')[1]} — {formatTime(task.end_time)}
                                        </div>
                                    </div>

                                    {/* Column 2: Details */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className={`text-lg font-bold ${titleText}`}>{task.title}</h3>
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded border font-bold ${PRIORITY_BADGE[task.priority]}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-5 text-[11px] font-bold text-slate-400">
                                            <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                {task.user_type}
                                            </span>
                                            <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                {task.duration_minutes} Minutes
                                            </span>
                                            <span className={`flex items-center gap-1.5 uppercase tracking-wide ${task.status === 'at_risk' ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'at_risk' ? 'bg-rose-500' : 'bg-emerald-600'}`}></span>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column 3: Deadline */}
                                    <div className="md:text-right bg-slate-50 dark:bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                        <p className={`text-sm font-bold ${titleText}`}>{formatDate(task.deadline)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}