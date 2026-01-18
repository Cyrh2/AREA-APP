
import { Plus, Link as LinkIcon, Unlink, ExternalLink } from 'lucide-react';
import type { Service } from '../types';
import { ServiceLogo } from './ServiceLogo';
import { BASE_URL } from '../lib/api';

export const ServiceGridItem = ({ service, connected, onToggle, userId }: { service: Service, connected: boolean, onToggle: (slug: string, status: boolean) => void, userId?: string }) => {
    const isDiscord = service.slug.toLowerCase() === 'discord';

    const handleInviteBot = () => {
        if (!userId) return;
        window.location.href = `${BASE_URL}/services/discord/invite-bot?userId=${userId}&redirect=web`;
    };

    return (
        <div className="bg-white/70 dark:bg-[#11131A]/70 backdrop-blur-xl bg-noise border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 flex flex-col justify-between h-36 relative group">
            <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.color || 'bg-gray-500/10'} ${service.textColor || 'text-gray-500'}`}>
                    <ServiceLogo slug={service.slug} size={20} />
                </div>

                <div className="flex items-center gap-2">
                    {isDiscord && (
                        <button
                            onClick={handleInviteBot}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 p-2 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                            title="Inviter le Bot sur votre serveur"
                        >
                            <ExternalLink size={14} /> <span className="hidden sm:inline">Inviter Bot</span>
                        </button>
                    )}
                    <button onClick={() => onToggle(service.slug, !connected)} className="text-blue-500 font-bold text-sm">
                        {connected ? <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <Plus size={20} />}
                    </button>
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className={`text-xs ${connected ? 'text-green-500' : 'text-orange-500'}`}>
                        {connected ? <LinkIcon size={14} /> : <Unlink size={14} />}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{service.name}</h3>
                </div>
                <p className={`text-xs font-bold ${connected ? 'text-[#10B981]' : 'text-orange-500'}`}>
                    {connected ? 'Connecté' : 'Non connecté'}
                </p>
            </div>
        </div>
    );
};
