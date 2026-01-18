import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ServiceGridItem } from '../components/ServiceGridItem';
import type { Service } from '../types';
import servicesImage from '../assets/services.png';
import servicesLight from '../assets/light/services.png';
import { useTheme } from '../components/theme-provider';

export const Services = ({ services, connections, onToggleConnection, user }: { services: Service[], connections: Record<string, boolean>, onToggleConnection: (slug: string, status: boolean) => void, user: any }) => {
    const { theme } = useTheme();
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

    useEffect(() => {
        const handleStorageChange = () => {
            setLanguage(localStorage.getItem('language') || 'fr');
        };
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(handleStorageChange, 100);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const t = {
        title: language === 'fr' ? 'Services' : 'Services',
        subtitle: language === 'fr' ? 'Connecte ou configure les services utilisés par tes AREAs.' : 'Connect or configure services used by your AREAs.',
        connectedServices: language === 'fr' ? 'Services connectés' : 'Connected services',
        add: language === 'fr' ? 'Ajouter' : 'Add'
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black mb-2">{t.title}</h1>
                    <p className="text-gray-500">{t.subtitle}</p>
                </div>
                <img src={theme === 'light' ? servicesLight : servicesImage} alt="Services" className="h-32 w-auto object-contain" />
            </div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{t.connectedServices}</h2>
                <button className="text-[#2563EB] text-sm font-bold flex items-center gap-1 hover:underline">
                    <Plus size={16} /> {t.add}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {services.map(s => {
                    const slug = s.slug.toLowerCase();
                    const isAlwaysConnected = slug === 'timer' || slug === 'weather';
                    const isGoogleBased = slug === 'gmail' || slug === 'youtube';
                    const isConnected = isAlwaysConnected || (isGoogleBased ? connections['google'] || connections[slug] || connections['gmail'] || connections['youtube'] : connections[slug]);

                    return (
                        <ServiceGridItem
                            key={s.id}
                            service={s}
                            connected={!!isConnected}
                            onToggle={isAlwaysConnected ? () => { } : onToggleConnection}
                            userId={user?.id}
                        />
                    );
                })}
            </div>
        </div>
    );
};
