
import { Loader2 } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, icon: Icon, disabled = false, title, loading = false, as: Component = 'button', href }: any) => {
    const base = "px-4 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-900/20",
        success: "bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-green-900/20",
        secondary: "bg-[#1C1E26] hover:bg-[#252836] text-white border border-gray-800",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        ghost: "text-gray-400 hover:text-white"
    };

    const props = {
        onClick,
        disabled: disabled || loading,
        title,
        href,
        className: `${base} ${variants[variant as keyof typeof variants]} ${className} ${fullWidth ? 'w-full' : ''}`
    };

    return (
        <Component {...props}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : (Icon && <Icon size={18} />)}
            {loading ? 'Chargement...' : children}
        </Component>
    );
};
