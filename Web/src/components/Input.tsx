

export const Input = ({ label, type = "text", value, onChange, placeholder, labelClassName }: any) => (
    <div className="mb-4">
        <label className={`block text-sm font-bold mb-2 ${labelClassName || 'text-gray-200'}`}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#11131A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50"
        />
    </div>
);
