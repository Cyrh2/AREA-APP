import { useState } from 'react';
import { X, ChevronRight, ArrowRight, Save, CheckCircle, Trash2, ChevronLeft, Plus } from 'lucide-react';
import type { Area, Service, ConfigSchema } from '../types';
import { BASE_URL } from '../lib/api';
import { Button } from './Button';
import { Input } from './Input';
import { DynamicInput } from './DynamicInput';
import { areaService } from '../services/area.service';
import { getLocalActionConfig, getLocalReactionConfig } from '../data/services';
import { ServiceLogo } from './ServiceLogo';

export const CreateAreaWizard = ({ onClose, initialArea, onDelete, services, connections }: { onClose: () => void, initialArea?: Area, onDelete?: (area: Area) => void, services: Service[], connections: Record<string, boolean> }) => {
    const [step, setStep] = useState(1);

    const [actionServiceId, setActionServiceId] = useState<number | null>(initialArea ? services.find(s => s.actions.some(a => a.id === initialArea.action_id))?.id || null : null);
    const [actionId, setActionId] = useState<number | null>(initialArea?.action_id || null);
    const [actionParams, setActionParams] = useState<any>(initialArea?.action_params || {});

    const [reactionServiceId, setReactionServiceId] = useState<number | null>(initialArea ? services.find(s => s.reactions.some(r => r.id === initialArea.reaction_id))?.id || null : null);
    const [reactionId, setReactionId] = useState<number | null>(initialArea?.reaction_id || null);
    const [reactionParams, setReactionParams] = useState<any>(initialArea?.reaction_params || {});

    const [areaName, setAreaName] = useState(initialArea?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedActionServiceDef = services.find(s => s.id === actionServiceId);
    const selectedActionDef = selectedActionServiceDef?.actions.find(a => a.id === actionId);
    const selectedReactionServiceDef = services.find(s => s.id === reactionServiceId);
    const selectedReactionDef = selectedReactionServiceDef?.reactions.find(r => r.id === reactionId);

    // Get Local Config Override
    const localActionConfig = selectedActionDef ? getLocalActionConfig(selectedActionServiceDef?.slug || '', selectedActionDef.slug) : null;
    const localReactionConfig = selectedReactionDef ? getLocalReactionConfig(selectedReactionServiceDef?.slug || '', selectedReactionDef.slug) : null;


    // --- Dynamic Field Logic based on 18-AREA Spec ---

    const getFieldConfig = (serviceSlug: string, _itemName: string, paramKey: string): any => {
        // --- NEW SPEC: NO DROPDOWNS, MANUAL INPUTS ---

        if (serviceSlug === 'github') {
            if (paramKey === 'repository') return { type: 'text', placeholder: 'owner/repo (ex: torvalds/linux)' };
        }

        if (serviceSlug === 'discord') {
            if (paramKey === 'channel_id') return {
                type: 'text',
                placeholder: 'Collez l\'ID du salon ici...',
                helpText: 'Activez le Mode Développeur sur Discord, faites Clic-Droit sur le salon > Copier l\'identifiant.'
            };
        }

        if (serviceSlug === 'youtube') {
            if (paramKey === 'channel_id') return { type: 'text', placeholder: 'ID de la chaîne (ex: UC...)' };
            if (paramKey === 'playlist_id') return { type: 'text', placeholder: 'ID de la playlist (ex: PL...)' };
            if (paramKey === 'video_id') return { type: 'text', placeholder: 'ID de la vidéo (ex: dQw4w9WgXcQ)' };
        }

        if (serviceSlug === 'spotify') {
            if (paramKey === 'playlist_id') return { type: 'text', placeholder: 'Spotify Playlist ID' };
        }

        if (serviceSlug === 'weather') {
            if (paramKey === 'location' || paramKey === 'city') return { type: 'text', placeholder: 'Ex: Paris' };
            if (paramKey === 'threshold') return { type: 'number', placeholder: 'Seuil (ex: 15)' };
            if (paramKey === 'condition') return { type: 'select', options: ['Rain', 'Clear', 'Clouds', 'Snow'].map(v => ({ value: v, label: v })) };
        }

        if (serviceSlug === 'timer') {
            if (paramKey === 'time' || paramKey === 'daily_at') return { type: 'time' };
            if (paramKey === 'interval_minutes' || paramKey === 'after_duration') return { type: 'number', placeholder: 'Minutes' };
            if (paramKey === 'day' || paramKey === 'weekday_at') return { type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(v => ({ value: v, label: v })) };
        }

        // Default fallbacks
        if (paramKey.includes('email') || paramKey === 'recipient') return { type: 'text', placeholder: 'client@example.com' };

        return {};
    };

    const renderSchemaProps = (schema: ConfigSchema | undefined, serviceSlug: string, itemName: string, params: any, setParams: any) => {
        if (!schema?.properties) return null;
        return Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
            if (prop.description?.includes('(auto-managed)')) return null;

            const config = getFieldConfig(serviceSlug, itemName, key);

            // Override type if prop.type suggests number/integer and no specific config
            let finalType = config.type || 'text';
            if ((prop.type === 'integer' || prop.type === 'number') && finalType === 'text') {
                finalType = 'number';
            }

            return (
                <DynamicInput
                    key={key}
                    label={prop.description || key}
                    placeholder={config.placeholder || `Entrez ${prop.description || key}`}
                    value={params[key] || ''}
                    onChange={(val: any) => setParams((prev: any) => ({ ...prev, [key]: val }))}
                    type={finalType as any}
                    options={config.options}
                    helpText={config.helpText}
                />
            );
        });
    };

    const processParams = (params: any, schema: ConfigSchema | undefined) => {
        if (!schema?.properties) return params;
        const newParams = { ...params };
        Object.keys(newParams).forEach(key => {
            const prop = schema.properties[key];
            if (prop && (prop.type === 'integer' || prop.type === 'number')) {
                newParams[key] = Number(newParams[key]);
            }
        });
        return newParams;
    };

    const handleFinish = async () => {
        if (!areaName) return alert("Nom requis");
        setIsSubmitting(true);

        const areaData = {
            action_id: actionId || 0,
            reaction_id: reactionId || 0,
            action_params: processParams(actionParams, selectedActionDef?.config_schema),
            reaction_params: processParams(reactionParams, selectedReactionDef?.config_schema),
            name: areaName
        };

        try {
            if (initialArea?.id) {
                await areaService.update(initialArea.id, {
                    ...areaData,
                    action_id: actionId || undefined,
                    reaction_id: reactionId || undefined
                });
            } else {
                await areaService.create(areaData);
            }
            onClose();
        } catch (error) {
            console.error("Error saving area:", error);
            alert(`Erreur de sauvegarde: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        if (initialArea && onDelete) {
            onDelete(initialArea);
            onClose();
        }
    };

    const isConnected = (slug?: string) => {
        if (!slug) return true;
        const s = slug.toLowerCase();
        // Timer and Weather don't need authentication
        if (s === 'timer' || s === 'weather') return true;

        // Gmail and YouTube both use Google OAuth
        if (s === 'gmail' || s === 'youtube') return !!connections['google'] || !!connections[s];

        return !!connections[s] || !!connections[slug];
    };

    const getConnectUrl = (serviceSlug: string) => {
        let slug = serviceSlug.toLowerCase();
        if (slug === 'gmail' || slug === 'mail') slug = 'google';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user.token || '';
        return `${BASE_URL}/services/${slug}/connect?userId=${userId}&redirect=web`;
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Choisir un déclencheur (Action)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {services.filter(s => s.actions.length > 0).map(s => {
                                const active = isConnected(s.slug);
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => { setActionServiceId(s.id); setStep(2); }}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all relative overflow-hidden ${actionServiceId === s.id
                                            ? 'bg-blue-600/10 border-blue-600'
                                            : 'bg-white dark:bg-[#11131A] border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        {!active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" title="Non connecté" />}
                                        <div className={`p-2 rounded-lg ${s.color || 'bg-gray-500/10'} ${s.textColor || 'text-gray-500'}`}>
                                            <ServiceLogo slug={s.slug} size={20} />
                                        </div>
                                        <span className="font-bold text-sm">{s.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${selectedActionServiceDef?.color} ${selectedActionServiceDef?.textColor}`}>
                                <ServiceLogo slug={selectedActionServiceDef?.slug || ''} size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Configurer l'action</h2>
                        </div>
                        <div className="grid gap-2">
                            {selectedActionServiceDef?.actions.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => setActionId(a.id)}
                                    className={`text-left p-4 rounded-xl border transition-all ${actionId === a.id ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-white' : 'bg-white dark:bg-[#11131A] border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <div className="font-bold text-sm">{a.name}</div>
                                    <div className="text-xs opacity-70">{a.description}</div>
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            {!isConnected(selectedActionServiceDef?.slug) ? (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center space-y-4">
                                    <p className="text-sm text-gray-400 italic">Vous devez connecter ce service pour utiliser ses actions.</p>
                                    <Button as="a" href={getConnectUrl(selectedActionServiceDef?.slug || '')} icon={ChevronRight}>Se connecter à {selectedActionServiceDef?.name}</Button>
                                    {selectedActionServiceDef?.slug === 'discord' && (
                                        <div className="pt-2">
                                            <Button variant="secondary" className="!py-1.5 !px-3 !text-xs" as="a" href="https://discord.com/api/oauth2/authorize?client_id=1446563741150871645&permissions=8&scope=bot%20applications.commands" target="_blank" icon={Plus}>Inviter le Bot</Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {localActionConfig ? (
                                        // Use LOCAL Hardcoded Schema
                                        localActionConfig.fields.map(field => (
                                            <DynamicInput
                                                key={field.name}
                                                label={field.label}
                                                placeholder={field.placeholder || ''}
                                                value={actionParams[field.name] || ''}
                                                onChange={(val: any) => setActionParams((prev: any) => ({ ...prev, [field.name]: val }))}
                                                type={field.type}
                                                options={field.options}
                                                helpText={field.helpText}
                                            />
                                        ))
                                    ) : (
                                        // Fallback to old logic if no local config found (shouldn't happen if we covered all)
                                        <>
                                            {selectedActionDef?.ui_schema ? (
                                                selectedActionDef.ui_schema.map(field => {
                                                    const config = getFieldConfig(selectedActionServiceDef?.slug || '', selectedActionDef.name, field.name);
                                                    return (
                                                        <DynamicInput
                                                            key={field.name}
                                                            label={field.label || field.name}
                                                            placeholder={config.placeholder || field.placeholder || `Entrez ${field.label || field.name}`}
                                                            value={actionParams[field.name] || ''}
                                                            onChange={(val: any) => setActionParams((prev: any) => ({ ...prev, [field.name]: val }))}
                                                            type={config.type || field.type || 'text' as any}
                                                            options={field.options ? (field.options as any[]).map(o => typeof o === 'string' ? { value: o, label: o } : o) : config.options}
                                                            helpText={config.helpText}
                                                        />
                                                    );
                                                })
                                            ) : selectedActionDef?.config_schema
                                                ? renderSchemaProps(
                                                    selectedActionDef.config_schema,
                                                    selectedActionServiceDef?.slug || '',
                                                    selectedActionDef.name,
                                                    actionParams,
                                                    setActionParams
                                                )
                                                : selectedActionDef?.params?.map(param => {
                                                    const config = getFieldConfig(selectedActionServiceDef?.slug || '', selectedActionDef.name, param.name);
                                                    return (
                                                        <DynamicInput
                                                            key={param.name}
                                                            label={param.label}
                                                            placeholder={config.placeholder || `Entrez ${param.label}`}
                                                            value={actionParams[param.name] || ''}
                                                            onChange={(val: any) => setActionParams((prev: any) => ({ ...prev, [param.name]: val }))}
                                                            type={config.type || 'text' as any}
                                                            options={config.options}
                                                            helpText={config.helpText}
                                                        />
                                                    );
                                                })
                                            }
                                            {(!localActionConfig && !selectedActionDef?.params && !selectedActionDef?.config_schema && !selectedActionDef?.ui_schema) && (
                                                <p className="text-sm text-gray-500 italic">Aucun paramètre requis pour cette action.</p>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button disabled={!actionId || !isConnected(selectedActionServiceDef?.slug)} onClick={() => setStep(3)}>Suivant <ChevronRight size={16} /></Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Choisir une Réaction</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {services.filter(s => s.reactions.length > 0).map(s => {
                                const active = isConnected(s.slug);
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => { setReactionServiceId(s.id); setStep(4); }}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all relative overflow-hidden ${reactionServiceId === s.id
                                            ? 'bg-emerald-500/10 border-emerald-500'
                                            : 'bg-white dark:bg-[#11131A] border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        {!active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" title="Non connecté" />}
                                        <div className={`p-2 rounded-lg ${s.color || 'bg-gray-500/10'} ${s.textColor || 'text-gray-500'}`}>
                                            <ServiceLogo slug={s.slug} size={20} />
                                        </div>
                                        <span className="font-bold text-sm">{s.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${selectedReactionServiceDef?.color} ${selectedReactionServiceDef?.textColor}`}>
                                <ServiceLogo slug={selectedReactionServiceDef?.slug || ''} size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Configurer la réaction</h2>
                        </div>
                        <div className="grid gap-2">
                            {selectedReactionServiceDef?.reactions.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setReactionId(r.id)}
                                    className={`text-left p-4 rounded-xl border transition-all ${reactionId === r.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-white' : 'bg-white dark:bg-[#11131A] border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <div className="font-bold text-sm">{r.name}</div>
                                    <div className="text-xs opacity-70">{r.description}</div>
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            {!isConnected(selectedReactionServiceDef?.slug) ? (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center space-y-4">
                                    <p className="text-sm text-gray-400 italic">Vous devez connecter ce service pour utiliser ses réactions.</p>
                                    <Button as="a" href={getConnectUrl(selectedReactionServiceDef?.slug || '')} icon={ChevronRight}>Se connecter à {selectedReactionServiceDef?.name}</Button>
                                    {selectedReactionServiceDef?.slug === 'discord' && (
                                        <div className="pt-2">
                                            <Button variant="secondary" className="!py-1.5 !px-3 !text-xs" as="a" href="https://discord.com/api/oauth2/authorize?client_id=1446563741150871645&permissions=8&scope=bot%20applications.commands" target="_blank" icon={Plus}>Inviter le Bot</Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {localReactionConfig ? (
                                        // Use LOCAL Hardcoded Schema
                                        localReactionConfig.fields.map(field => (
                                            <DynamicInput
                                                key={field.name}
                                                label={field.label}
                                                placeholder={field.placeholder || ''}
                                                value={reactionParams[field.name] || ''}
                                                onChange={(val: any) => setReactionParams((prev: any) => ({ ...prev, [field.name]: val }))}
                                                type={field.type}
                                                options={field.options}
                                                helpText={field.helpText}
                                            />
                                        ))
                                    ) : (
                                        <>
                                            {selectedReactionDef?.ui_schema ? (
                                                selectedReactionDef.ui_schema.map(field => {
                                                    const config = getFieldConfig(selectedReactionServiceDef?.slug || '', selectedReactionDef.name, field.name);
                                                    return (
                                                        <DynamicInput
                                                            key={field.name}
                                                            label={field.label || field.name}
                                                            placeholder={config.placeholder || field.placeholder || `Entrez ${field.label || field.name}`}
                                                            value={reactionParams[field.name] || ''}
                                                            onChange={(val: any) => setReactionParams((prev: any) => ({ ...prev, [field.name]: val }))}
                                                            type={config.type || field.type || 'text' as any}
                                                            options={field.options ? (field.options as any[]).map(o => typeof o === 'string' ? { value: o, label: o } : o) : config.options}
                                                            helpText={config.helpText}
                                                        />
                                                    );
                                                })
                                            ) : selectedReactionDef?.config_schema
                                                ? renderSchemaProps(
                                                    selectedReactionDef.config_schema,
                                                    selectedReactionServiceDef?.slug || '',
                                                    selectedReactionDef.name,
                                                    reactionParams,
                                                    setReactionParams
                                                )
                                                : selectedReactionDef?.params?.map(param => {
                                                    const config = getFieldConfig(selectedReactionServiceDef?.slug || '', selectedReactionDef.name, param.name);
                                                    return (
                                                        <DynamicInput
                                                            key={param.name}
                                                            label={param.label}
                                                            placeholder={config.placeholder || `Entrez ${param.label}`}
                                                            value={reactionParams[param.name] || ''}
                                                            onChange={(val: any) => setReactionParams((prev: any) => ({ ...prev, [param.name]: val }))}
                                                            type={config.type || 'text' as any}
                                                            options={config.options}
                                                            helpText={config.helpText}
                                                        />
                                                    );
                                                })
                                            }
                                            {(!localReactionConfig && !selectedReactionDef?.params && !selectedReactionDef?.config_schema && !selectedReactionDef?.ui_schema) && (
                                                <p className="text-sm text-gray-500 italic">Aucun paramètre requis pour cette réaction.</p>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button disabled={!reactionId || !isConnected(selectedReactionServiceDef?.slug)} onClick={() => setStep(5)}>Suivant <ChevronRight size={16} /></Button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8 text-center">
                        <h2 className="text-2xl font-black">{initialArea ? 'Modifier l\'AREA' : 'Résumé'}</h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedActionServiceDef?.color} ${selectedActionServiceDef?.textColor}`}>
                                    <ServiceLogo slug={selectedActionServiceDef?.slug || ''} size={32} />
                                </div>
                                <span className="font-bold text-sm">{selectedActionServiceDef?.name}</span>
                            </div>
                            <ArrowRight className="text-gray-600" />
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedReactionServiceDef?.color} ${selectedReactionServiceDef?.textColor}`}>
                                    <ServiceLogo slug={selectedReactionServiceDef?.slug || ''} size={32} />
                                </div>
                                <span className="font-bold text-sm">{selectedReactionServiceDef?.name}</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#11131A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-left space-y-3">
                            <div>
                                <span className="text-blue-500 font-bold text-xs uppercase">Si</span>
                                <p className="font-medium text-gray-900 dark:text-gray-300">{selectedActionDef?.name}</p>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-2">
                                <span className="text-green-500 font-bold text-xs uppercase">Alors</span>
                                <p className="font-medium text-gray-900 dark:text-gray-300">{selectedReactionDef?.name}</p>
                            </div>
                        </div>
                        <Input label="Nommer votre AREA" placeholder="Ex: Sauvegarde Auto" value={areaName} onChange={setAreaName} />
                        <div className="space-y-3">
                            <Button fullWidth onClick={handleFinish} disabled={isSubmitting || !areaName} variant="success" icon={initialArea ? Save : CheckCircle} loading={isSubmitting}>
                                {initialArea ? 'Mettre à jour' : 'Valider et Activer'}
                            </Button>
                            {initialArea && onDelete && (
                                <Button fullWidth onClick={handleDelete} variant="danger" icon={Trash2}>
                                    Supprimer cet AREA
                                </Button>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#020617] w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] text-gray-900 dark:text-white transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg">{initialArea ? 'Éditer AREA' : 'Créer un AREA'}</h2>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1 w-6 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {renderStep()}
                </div>
                {step > 1 && step < 5 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#020617]/50 rounded-b-3xl">
                        <Button variant="ghost" onClick={() => setStep(step - 1)} icon={ChevronLeft}>Retour</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
