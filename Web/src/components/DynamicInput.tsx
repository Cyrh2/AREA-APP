import { useState, useEffect } from 'react';
import { Input } from './Input';
import { TimePicker } from './TimePicker';
import { Loader2 } from 'lucide-react';

export interface DynamicInputProps {
    type: 'text' | 'number' | 'time' | 'select' | 'async-select' | 'email' | 'textarea';
    label: string;
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
    options?: { value: string; label: string }[]; // For static select
    loadOptions?: () => Promise<{ value: string; label: string }[]>; // For async select
    helpText?: string;
}


export const DynamicInput = ({ type, label, value, onChange, placeholder, options = [], loadOptions, helpText }: DynamicInputProps) => {
    const [headerOptions, setHeaderOptions] = useState<{ value: string; label: string }[]>(options);
    const [loading, setLoading] = useState(false);

    // Effect for Async Select
    useEffect(() => {
        if (type === 'async-select' && loadOptions) {
            setLoading(true);
            loadOptions()
                .then(opts => setHeaderOptions(opts))
                .catch(err => console.error("Failed to load options", err))
                .finally(() => setLoading(false));
        }
    }, [type, loadOptions]);

    // Effect for Static Select
    useEffect(() => {
        if (type === 'select') {
            setHeaderOptions(options);
        }
    }, [type, options]);

    if (type === 'time') {
        return <TimePicker label={label} value={value} onChange={onChange} />;
    }

    if (type === 'select' || type === 'async-select') {
        return (
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-200 mb-2">{label}</label>
                <div className="relative">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-[#11131A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 appearance-none"
                    >
                        <option value="">{placeholder || "Sélectionner..."}</option>
                        {headerOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-blue-500" size={18} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-200 mb-2">{label}</label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[#11131A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 min-h-[120px]"
                />
                {helpText && <p className="text-[10px] text-gray-500 italic mt-1">{helpText}</p>}
            </div>
        );
    }

    // Default to text/number/email input
    return (
        <div className="space-y-1">
            <Input
                label={label}
                type={type === 'number' ? 'number' : type === 'email' ? 'email' : 'text'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {helpText && <p className="text-[10px] text-gray-500 italic mt-1">{helpText}</p>}
        </div>
    );
};

