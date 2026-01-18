export interface UIField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'time' | 'select' | 'textarea' | 'email';
    placeholder?: string;
    options?: { value: string; label: string }[];
    helpText?: string;
    required?: boolean;
}

export interface UIActionDefinition {
    slug: string;
    fields: UIField[];
}

export const SERVICE_DEFINITIONS: Record<string, {
    actions: Record<string, UIActionDefinition>;
    reactions: Record<string, UIActionDefinition>;
}> = {
    github: {
        actions: {
            'github_issue_assigned': {
                slug: 'github_issue_assigned',
                fields: [
                    { name: 'repository', label: 'Repository', type: 'text', placeholder: 'owner/repo (ex: torvalds/linux)', required: true }
                ]
            },
            'github_push': {
                slug: 'github_push',
                fields: [
                    { name: 'repository', label: 'Repository', type: 'text', placeholder: 'owner/repo', required: true }
                ]
            },
            'github_pr_created': {
                slug: 'github_pr_created',
                fields: [
                    { name: 'repository', label: 'Repository', type: 'text', placeholder: 'owner/repo', required: true }
                ]
            }
        },
        reactions: {
            'github_create_issue': {
                slug: 'github_create_issue',
                fields: [
                    { name: 'repository', label: 'Repository', type: 'text', placeholder: 'owner/repo', required: true },
                    { name: 'title', label: 'Titre', type: 'text', placeholder: 'Titre de l\'issue', required: true },
                    { name: 'body', label: 'Description', type: 'textarea', placeholder: 'Description...', required: true }
                ]
            }
        }
    },
    discord: {
        actions: {
            'discord_message_keyword': {
                slug: 'discord_message_keyword',
                fields: [
                    { name: 'channel_id', label: 'ID du Salon', type: 'text', placeholder: 'Collez l\'ID du salon...', helpText: 'Activez le Mode Développeur sur Discord -> Clic-droit sur le salon -> Copier l\'identifiant', required: true },
                    { name: 'keyword', label: 'Mot-clé', type: 'text', placeholder: '!bug', required: true }
                ]
            }
        },
        reactions: {
            'discord_send_message': {
                slug: 'discord_send_message',
                fields: [
                    { name: 'channel_id', label: 'ID du Salon', type: 'text', placeholder: 'Collez l\'ID du salon...', helpText: 'Activez le Mode Développeur sur Discord -> Clic-droit sur le salon -> Copier l\'identifiant', required: true },
                    { name: 'message', label: 'Message', type: 'text', placeholder: 'Votre message...', required: true }
                ]
            }
        }
    },
    google: { // Covers Gmail
        actions: {
            'gmail_received': {
                slug: 'gmail_received',
                fields: [
                    { name: 'from_address', label: 'Expéditeur', type: 'email', placeholder: 'boss@epitech.eu', required: true }
                ]
            },
            'gmail_subject_match': {
                slug: 'gmail_subject_match',
                fields: [
                    { name: 'keyword', label: 'Mot-clé dans l\'objet', type: 'text', placeholder: '[BUG]', required: true }
                ]
            }
        },
        reactions: {
            'gmail_send_email': {
                slug: 'gmail_send_email',
                fields: [
                    { name: 'recipient', label: 'Destinataire', type: 'email', placeholder: 'client@example.com', required: true },
                    { name: 'subject', label: 'Objet', type: 'text', placeholder: 'Objet...', required: true },
                    { name: 'body', label: 'Corps du mail', type: 'textarea', placeholder: 'Votre message...', required: true }
                ]
            }
        }
    },
    youtube: {
        actions: {
            'youtube_new_liked_video': {
                slug: 'youtube_new_liked_video',
                fields: []
            },
            'youtube_new_video_by_channel': {
                slug: 'youtube_new_video_by_channel',
                fields: [
                    { name: 'channel_id', label: 'ID de la chaîne', type: 'text', placeholder: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', required: true }
                ]
            }
        },
        reactions: {
            'youtube_add_video_to_playlist': {
                slug: 'youtube_add_video_to_playlist',
                fields: [
                    { name: 'playlist_id', label: 'ID de la Playlist', type: 'text', placeholder: 'PL...', required: true },
                    { name: 'video_id', label: 'ID de la Vidéo', type: 'text', placeholder: 'dQw4w9WgXcQ', required: true }
                ]
            }
        }
    },
    weather: {
        actions: {
            'weather_condition_check': {
                slug: 'weather_condition_check',
                fields: [
                    { name: 'city', label: 'Ville', type: 'text', placeholder: 'Cotonou', required: true },
                    {
                        name: 'condition', label: 'Condition', type: 'select', options: [
                            { value: 'Rain', label: 'Pluie' },
                            { value: 'Clear', label: 'Ciel Dégagé' },
                            { value: 'Clouds', label: 'Nuageux' },
                            { value: 'Snow', label: 'Neige' }
                        ], required: true
                    }
                ]
            },
            'weather_temp_drop': {
                slug: 'weather_temp_drop',
                fields: [
                    { name: 'city', label: 'Ville', type: 'text', placeholder: 'Cotonou', required: true },
                    { name: 'threshold', label: 'Seuil de Température (°C)', type: 'number', placeholder: '15', required: true }
                ]
            }
        },
        reactions: {}
    },
    timer: {
        actions: {
            'timer_daily_cron': {
                slug: 'timer_daily_cron',
                fields: [
                    { name: 'time', label: 'Heure (HH:MM)', type: 'time', required: true }
                ]
            },
            'timer_monthly_cron': {
                slug: 'timer_monthly_cron',
                fields: [
                    { name: 'day', label: 'Jour du mois (1-31)', type: 'number', placeholder: '1', required: true },
                    { name: 'time', label: 'Heure (HH:MM)', type: 'time', required: true }
                ]
            },
            'timer_weekly_cron': {
                slug: 'timer_weekly_cron',
                fields: [
                    {
                        name: 'day', label: 'Jour de la semaine', type: 'select', options: [
                            { value: '1', label: 'Lundi' }, // Assuming backend uses 1-7 or similar. Let's use strings or mapping. Backend likely uses cron.
                            // Standard cron 1=Mon, 7=Sun or 0=Sun. Let's assume standard names for now or simple values.
                            { value: 'Mon', label: 'Lundi' },
                            { value: 'Tue', label: 'Mardi' },
                            { value: 'Wed', label: 'Mercredi' },
                            { value: 'Thu', label: 'Jeudi' },
                            { value: 'Fri', label: 'Vendredi' },
                            { value: 'Sat', label: 'Samedi' },
                            { value: 'Sun', label: 'Dimanche' }
                        ], required: true
                    },
                    { name: 'time', label: 'Heure (HH:MM)', type: 'time', required: true }
                ]
            }
        },
        reactions: {}
    }
};

// Start 1:4 mapped to Actions
export const getLocalActionConfig = (serviceSlug: string, actionSlug: string): UIActionDefinition | null => {
    // Mapping backend slugs to our defined slugs if names differ, but ideally they match.
    // The backend slugs are like 'github_push', 'timer_daily_cron'.
    const service = SERVICE_DEFINITIONS[serviceSlug] || SERVICE_DEFINITIONS[Object.keys(SERVICE_DEFINITIONS).find(k => k.includes(serviceSlug)) || ''];
    if (!service) return null;

    // Direct lookup
    if (service.actions[actionSlug]) return service.actions[actionSlug];

    // Fuzzy lookup or partial match
    const key = Object.keys(service.actions).find(k => actionSlug.includes(k) || k.includes(actionSlug));
    return key ? service.actions[key] : null;
};

export const getLocalReactionConfig = (serviceSlug: string, reactionSlug: string): UIActionDefinition | null => {
    const service = SERVICE_DEFINITIONS[serviceSlug] || SERVICE_DEFINITIONS[Object.keys(SERVICE_DEFINITIONS).find(k => k.includes(serviceSlug)) || ''];
    if (!service) return null;

    if (service.reactions[reactionSlug]) return service.reactions[reactionSlug];

    const key = Object.keys(service.reactions).find(k => reactionSlug.includes(k) || k.includes(reactionSlug));
    return key ? service.reactions[key] : null;
};
