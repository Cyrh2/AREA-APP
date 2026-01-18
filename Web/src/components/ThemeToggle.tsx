import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#11131A] text-gray-500 dark:text-gray-400 transition-colors"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
