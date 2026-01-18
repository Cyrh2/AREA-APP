import { useState, useEffect } from 'react';
import { Plus, Activity, Layers, Search } from 'lucide-react';
import type { Area, Service } from '../types';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { AreaCard } from '../components/AreaCard';
import helloImage from '../assets/hello.png';
import helloLight from '../assets/light/hello.png';
import { useTheme } from '../components/theme-provider';
// import { ActivityRow } from '../components/ActivityRow';

interface DashboardProps {
    user: any;
    areas: Area[];
    onToggleArea: (area: Area) => void;
    onDeleteArea: (area: Area) => void;
    onRunArea: (area: Area) => void;
    onOpenCreator: () => void;
    onEditArea: (area: Area) => void;
    services: Service[];
}

export const Dashboard = ({ user, areas, onToggleArea, onDeleteArea, onRunArea, onOpenCreator, onEditArea, services }: DashboardProps) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'favorite'>('all');
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
        greeting: language === 'fr' ? 'Bonjour' : 'Hello',
        subtitle: language === 'fr' ? 'Gérez vos automatisations et surveillez l\'activité.' : 'Manage your automations and monitor activity.',
        newArea: language === 'fr' ? 'Nouvelle Area' : 'New Area',
        activeAreas: language === 'fr' ? 'Areas Actives' : 'Active Areas',
        outOf: language === 'fr' ? 'Sur un total de' : 'Out of',
        executions: language === 'fr' ? 'Exécutions' : 'Executions',
        thisMonth: language === 'fr' ? 'ce mois' : 'this month',
        timeSaved: language === 'fr' ? 'Temps gagné' : 'Time Saved',
        thisWeek: language === 'fr' ? 'Cette semaine' : 'This week',
        myAreas: language === 'fr' ? 'Mes AREAs' : 'My AREAs',
        total: language === 'fr' ? 'au total' : 'total',
        search: language === 'fr' ? 'Rechercher un AREA...' : 'Search an AREA...',
        all: language === 'fr' ? 'Tous' : 'All',
        active: language === 'fr' ? 'Actifs' : 'Active',
        inactive: language === 'fr' ? 'Inactifs' : 'Inactive',
        favorites: language === 'fr' ? 'Favoris' : 'Favorites',
        noAutomation: language === 'fr' ? 'Aucune automation' : 'No automation',
        noAutomationDesc: language === 'fr' ? 'Commencez par créer votre première automation pour gagner du temps.' : 'Start by creating your first automation to save time.',
        createArea: language === 'fr' ? 'Créer une Area' : 'Create an Area',
        noAreaFound: language === 'fr' ? 'Aucun AREA trouvé.' : 'No AREA found.',
        recentActivity: language === 'fr' ? 'Activité Récente' : 'Recent Activity',
        noActivity: language === 'fr' ? 'Aucune activité.' : 'No activity.'
    };

    const filteredAreas = areas.filter(area => {
        const matchesSearch = searchQuery === '' ||
            area.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            services.find(s => s.actions.some(a => a.id === area.action_id))?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            services.find(s => s.reactions.some(r => r.id === area.reaction_id))?.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'active') return area.is_active;
        if (filter === 'inactive') return !area.is_active;
        // Backend doesn't support favorites yet, so 'favorite' filter might show nothing or we can implement local favorites later
        if (filter === 'favorite') return false;
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight text-gray-900 dark:text-white">
                        {t.greeting}, <span className="text-blue-500">{user?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Utilisateur'}</span> 👋
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
                </div>
                <Button onClick={onOpenCreator} icon={Plus} className="shadow-blue-900/20 shadow-lg">{t.newArea}</Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-center">
                <StatCard label={t.activeAreas} value={areas.filter(a => a.is_active).length} sub={`${t.outOf} ${areas.length}`} />
                <StatCard label={t.executions} value="0" sub={`+0% ${t.thisMonth}`} />
                <StatCard label={t.timeSaved} value="0h" sub={t.thisWeek} />
                <img src={theme === 'light' ? helloLight : helloImage} alt="Hello" className="h-64 w-auto object-contain" />
            </div>

            <div>
                <div className="flex flex-col gap-6 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">{t.myAreas} <span className="text-sm font-normal text-gray-500 ml-auto">{areas.length} {t.total}</span></h3>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise border border-gray-200 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: t.all },
                            { id: 'active', label: t.active },
                            { id: 'inactive', label: t.inactive },
                            { id: 'favorite', label: t.favorites }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border backdrop-blur-xl bg-noise ${filter === f.id
                                    ? 'bg-gray-900/70 dark:bg-[#1C1E26]/70 text-white border-gray-900 dark:border-gray-700'
                                    : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-800/70'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredAreas.length === 0 ? (
                    <div className="text-center py-12 bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-300">
                        {areas.length === 0 ? (
                            <>
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                                    <Layers className="text-gray-500" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.noAutomation}</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">{t.noAutomationDesc}</p>
                                <Button onClick={onOpenCreator} icon={Plus} variant="secondary">{t.createArea}</Button>
                            </>
                        ) : (
                            <p className="text-gray-500">{t.noAreaFound}</p>
                        )}
                        {/* DEBUG: Services Data Structure */}
                        <div id="debug-services-json" className="hidden">
                            {JSON.stringify(services, null, 2)}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAreas.map(area => (
                            <AreaCard
                                key={area.id}
                                area={area}
                                onToggle={onToggleArea}
                                onDelete={onDeleteArea}
                                onRun={onRunArea}
                                onEdit={onEditArea}
                                services={services}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Activity size={20} className="text-blue-500" /> {t.recentActivity}</h3>
                <div className="space-y-1">
                    {/* Activity log not supported by backend yet */}
                    {/* {areas.slice(0, 5).map(area => (
                        <ActivityRow key={area.id} area={area} />
                    ))} */}
                    <div className="text-gray-500 text-sm italic">{t.noActivity}</div>
                </div>
            </div>
        </div>
    );
};
