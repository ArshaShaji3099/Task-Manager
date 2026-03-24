export default function AlertBanner({ tasks, darkMode }) {
    const now = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const overdue = tasks.filter(t => !t.is_completed && new Date(t.deadline) < now);
    const dueToday = tasks.filter(t => !t.is_completed && new Date(t.deadline) >= now && new Date(t.deadline) <= todayEnd);

    if (overdue.length === 0 && dueToday.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 mb-6">

            {/* Overdue Alert */}
            {overdue.length > 0 && (
                <div className={`rounded-xl px-5 py-4 border flex items-start gap-4 ${darkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}>
                    <span className="text-2xl flex-shrink-0">🚨</span>
                    <div className="flex-1">
                        <div className={`font-bold text-sm mb-1 ${darkMode ? "text-red-400" : "text-red-600"}`}>
                            {overdue.length} Overdue Task{overdue.length > 1 ? "s" : ""}!
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {overdue.map(t => (
                                <span key={t.id} className={`text-xs px-2.5 py-1 rounded-full font-medium
                  ${darkMode ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-red-100 text-red-600 border border-red-200"}`}>
                                    {t.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Due Today Alert */}
            {dueToday.length > 0 && (
                <div className={`rounded-xl px-5 py-4 border flex items-start gap-4 ${darkMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"}`}>
                    <span className="text-2xl flex-shrink-0">⏰</span>
                    <div className="flex-1">
                        <div className={`font-bold text-sm mb-1 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                            {dueToday.length} Task{dueToday.length > 1 ? "s" : ""} Due Today!
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {dueToday.map(t => (
                                <span key={t.id} className={`text-xs px-2.5 py-1 rounded-full font-medium
                  ${darkMode ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-yellow-100 text-yellow-600 border border-yellow-200"}`}>
                                    {t.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}