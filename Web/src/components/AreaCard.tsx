import { useState } from 'react';
import { Play, Trash2, Edit2 } from 'lucide-react';
import { Button } from './Button';
import type { Area, Service } from '../types';
import { ServiceLogo } from './ServiceLogo';

export const AreaCard = ({ area, onToggle, onEdit, onDelete, onRun, services }: { area: Area, onToggle: any, onEdit: any, onDelete: any, onRun: any, services: Service[] }) => {
    // Find service that contains the action/reaction
    const actionS = services.find(s => s.actions.some(a => a.id === area.action_id));
    const reactionS = services.find(s => s.reactions.some(r => r.id === area.reaction_id));

    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        await onRun(area);
        setTimeout(() => setIsRunning(false), 1000);
    };

    if (!actionS || !reactionS) return null;

    // Construct name if missing
    const displayName = area.name || (area.actions?.name && area.reactions?.name
        ? `${area.actions.name} ➔ ${area.reactions.name}`
        : `Area #${area.id}`);

    return (
        <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 backdrop-blur-xl bg-noise ${area.is_active ? 'bg-white/70 dark:bg-[#161922]/70 border-gray-200 dark:border-gray-800' : 'bg-gray-50/50 dark:bg-[#0B0D12]/50 border-gray-200 dark:border-gray-900 opacity-75'}`}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${actionS.color || 'bg-gray-500/10'} ${actionS.textColor || 'text-gray-500'} shadow-lg shadow-blue-900/20`}>
                            <ServiceLogo slug={actionS.slug} size={24} />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-0.5 h-4 bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reactionS.color || 'bg-gray-500/10'} ${reactionS.textColor || 'text-gray-500'} shadow-lg shadow-purple-900/20`}>
                            <ServiceLogo slug={reactionS.slug} size={24} />
                        </div>
                    </div>


                    <div className="flex gap-2">
                        <Button variant="ghost" className="!p-2 hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => onEdit(area)}><Edit2 size={18} /></Button>
                        <Button variant="ghost" className="!p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500" onClick={() => onDelete(area)}><Trash2 size={18} /></Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{displayName}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className="bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50">
                            If {actionS.name} then {reactionS.name}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onToggle(area)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${area.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${area.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-xs font-medium text-gray-500">{area.is_active ? 'Activé' : 'Désactivé'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Last triggered not in backend type yet */}
                        <Button
                            variant="secondary"
                            className="!py-1.5 !px-3 !text-xs !h-8"
                            onClick={handleRun}
                            loading={isRunning}
                            icon={Play}
                        >
                            Test
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
