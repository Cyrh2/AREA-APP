// server/src/controllers/serviceController.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getAllServices } = require('../services/index');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.getAllServices = async (req, res) => {
    try {
        // Get services from database with actions and reactions
        const { data: dbServices, error } = await supabase
            .from('services')
            .select(`
                *,
                actions(*),
                reactions(*)
            `);

        if (error) throw error;

        // Get service implementations from registry
        const serviceImplementations = getAllServices();

        // Merge database data with implementation details
        const enrichedServices = dbServices.map(dbService => {
            const impl = serviceImplementations.find(s => s.slug === dbService.slug);
            return {
                ...dbService,
                actions: dbService.actions.map(action => ({
                    ...action,
                    implementation: impl?.actions?.find(a => a.name === action.name) || null
                })),
                reactions: dbService.reactions.map(reaction => ({
                    ...reaction,
                    implementation: impl?.reactions?.find(r => r.name === reaction.name) || null
                }))
            };
        });

        res.status(200).json(enrichedServices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getServiceConfig = async (req, res) => {
    const { serviceSlug, actionName } = req.params;

    try {
        const { data, error } = await supabase
            .from('actions')
            .select('config_schema')
            .eq('name', actionName)
            .single();

        if (error) throw error;

        res.status(200).json(data.config_schema);
    } catch (error) {
        res.status(404).json({ error: 'Service configuration not found' });
    }
};

exports.getUserServicesStatus = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('oauth_tokens')
            .select('provider')
            .eq('user_id', userId);

        if (error) throw error;

        const status = {
            github: false,
            discord: false,
            google: false,
            youtube: false,
            gmail: false,
            google_drive: false
        };

        data.forEach(token => {
            if (status.hasOwnProperty(token.provider)) {
                status[token.provider] = true;
            }

            if (token.provider === 'google') {
                status.youtube = true;
                status.gmail = true;
                status.google_drive = true;
            }
        });

        res.status(200).json(status);

    } catch (error) {
        console.error('Error checking services status:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.disconnectService = async (req, res) => {
    let { provider } = req.params;
    const userId = req.query.userId || (req.body && req.body.userId);

    if (!userId || !provider) {
        return res.status(400).json({ error: 'Paramètres manquants.' });
    }

    if (['google_drive', 'gmail', 'youtube'].includes(provider)) {
        provider = 'google';
    }

    try {
        console.log(`[AUTH] Suppression du token '${provider}' pour l'user ${userId}`);

        const { error, count } = await supabase
            .from('oauth_tokens')
            .delete({ count: 'exact' })
            .eq('user_id', userId)
            .eq('provider', provider);

        if (error) throw error;

        if (count === 0) {
            return res.status(404).json({ error: 'Aucune connexion trouvée.' });
        }

        return res.status(200).json({ message: `Déconnecté de ${req.params.provider} avec succès.` });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};