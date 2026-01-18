import { Clock } from 'lucide-react';

interface TimePickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export const TimePicker = ({ label, value, onChange }: TimePickerProps) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-gray-200 mb-2">{label}</label>
        <div className="relative">
            <input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#11131A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 appearance-none"
                style={{ colorScheme: 'dark' }} // Force dark calendar/picker in some browsers
            />
            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
        </div>
    </div>
);
