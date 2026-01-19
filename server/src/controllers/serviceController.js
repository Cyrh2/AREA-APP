// server/src/controllers/serviceController.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getAllServices } = require('../services/index');

// ⚠️ IMPORTANT : On utilise la SERVICE_ROLE_KEY ici pour contourner le RLS
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

// New endpoint to get service configuration schema
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

// ✅ VERSION MISE À JOUR (Spotify -> YouTube)
exports.getUserServicesStatus = async (req, res) => {
    // 1. Récupération de l'ID User
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // 2. On interroge la table oauth_tokens
        const { data, error } = await supabase
            .from('oauth_tokens')
            .select('provider')
            .eq('user_id', userId);

        if (error) throw error;

        // 3. On initialise l'état de base
        // ❌ Spotify supprimé
        // ✅ YouTube ajouté (par défaut à false)
        const status = {
            github: false,
            discord: false,
            google: false,
            youtube: false,
            gmail: false
        };

        // 4. On met à jour les status
        data.forEach(token => {
            // Si le provider est dans la liste (github, discord, google)
            if (status.hasOwnProperty(token.provider)) {
                status[token.provider] = true;
            }

            // 🧠 LOGIQUE MAGIQUE GOOGLE (YouTube & Gmail)
            // Si l'utilisateur a un token 'google', alors YouTube et Gmail sont considérés comme connectés
            if (token.provider === 'google') {
                status.youtube = true;
                status.gmail = true;
            }
        });

        res.status(200).json(status);

    } catch (error) {
        console.error('Error checking services status:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.disconnectService = async (req, res) => {
    const { provider } = req.params;
    
    // On récupère l'ID user (soit via body, soit via query param)
    const userId = req.query.userId || (req.body && req.body.userId);

    if (!userId || !provider) {
        return res.status(400).json({ error: 'Paramètres manquants (userId ou provider).' });
    }

    try {
        console.log(`[AUTH] Demande de déconnexion du service ${provider} pour l'user ${userId}`);

        // 1. Suppression du token dans la table oauth_tokens
        const { error, count } = await supabase
            .from('oauth_tokens')
            .delete({ count: 'exact' })
            .eq('user_id', userId)
            .eq('provider', provider);

        if (error) throw error;

        if (count === 0) {
            return res.status(404).json({ message: 'Aucune connexion trouvée pour ce service.' });
        }

        console.log(`[SUCCESS] Token ${provider} supprimé pour l'utilisateur ${userId}.`);
        return res.status(200).json({ message: `Déconnecté de ${provider} avec succès.` });

    } catch (err) {
        console.error('[ERROR] Erreur déconnexion service:', err.message);
        return res.status(500).json({ error: 'Erreur serveur interne.' });
    }
};