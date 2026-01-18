

export const StatCard = ({ label, value, sub }: any) => (
    <div className="bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise p-5 rounded-2xl border border-gray-200 dark:border-gray-800/50 min-w-[140px] shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-xs text-gray-500 font-medium">{sub}</div>
    </div>
);
