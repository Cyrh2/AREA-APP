// controllers/areaController.js
const supabase = require('../config/supabase'); // Client standard pour les actions utilisateur
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Créer une nouvelle AREA
 */
exports.createArea = async (req, res) => {
    const userId = req.user.id;
    const { action_id, reaction_id, action_params, reaction_params, name } = req.body;

    try {
        if (!action_id || !reaction_id) {
            return res.status(400).json({ error: 'Action and Reaction IDs are required' });
        }
        
        let processedActionParams = { ...action_params };
        
        const { data: actionInfo } = await supabase
            .from('actions')
            .select('name, services(slug)')
            .eq('id', action_id)
            .single();
            
        if (actionInfo?.services?.slug === 'timer') {
            const timerActionsNeedingLastTrigger = ['interval_minutes', 'after_duration'];
            if (timerActionsNeedingLastTrigger.includes(actionInfo.name)) {
                if (!processedActionParams.last_trigger) {
                    processedActionParams.last_trigger = new Date(0).toISOString();
                }
            }
        }

        const { data, error } = await supabase
            .from('areas')
            .insert([{
                user_id: userId,
                action_id: parseInt(action_id),
                reaction_id: parseInt(reaction_id),
                action_params: processedActionParams || {},
                reaction_params: reaction_params || {},
                is_active: true,
                name: name || 'AREA without name'
            }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'AREA created successfully', area: data[0] });

    } catch (error) {
        console.error('Create AREA Error:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Mettre à jour une AREA
 */
exports.updateArea = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data, error } = await supabase
            .from('areas')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id || req.user.userId)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: "Area non trouvée ou accès refusé." });

        res.status(200).json({ message: "Area mise à jour avec succès", area: data[0] });

    } catch (error) {
        console.error('Update Area Error:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'AREA." });
    }
};

/**
 * Supprimer une AREA
 */
exports.deleteArea = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('areas')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id || req.user.userId)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: "Area non trouvée ou accès refusé." });

        res.status(200).json({ message: "Area supprimée avec succès." });

    } catch (error) {
        console.error('Delete Area Error:', error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'AREA." });
    }
};

exports.getUserAreas = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('areas')
            .select('*, actions(name), reactions(name)')
            .eq('user_id', userId);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * Tester une AREA (Version Robuste via Slugs)
 */
exports.testArea = async (req, res) => {
    const userId = req.user.id;
    const { areaId } = req.params;

    console.log(`[TEST] Demande de test manuel pour l'AREA ${areaId}`);

    try {
        const { data: area, error: fetchError } = await supabaseAdmin
            .from('areas')
            .select(`
                *,
                actions(name, slug, services(slug)),
                reactions(name, slug, services(slug))
            `)
            .eq('id', areaId)
            .single();

        if (fetchError || !area) {
            return res.status(404).json({ error: 'AREA introuvable ou accès refusé' });
        }
        const serviceSlug = area.reactions.services.slug.toLowerCase();
        const reactionInternalSlug = area.reactions.slug;        
        const reactionSlug = `${serviceSlug}_${reactionInternalSlug}`;
        
        console.log(`[TEST] Slug technique détecté: '${reactionSlug}' (Service: ${serviceSlug})`);

        let token = null;
        if (['gmail', 'youtube', 'google', 'github'].includes(serviceSlug)) {
            let providerKey = serviceSlug.includes('github') ? 'github' : 'google';
            
            const { data: tokenData } = await supabaseAdmin
                .from('oauth_tokens')
                .select('access_token')
                .eq('user_id', userId)
                .eq('provider', providerKey)
                .single();

            token = tokenData?.access_token;
        }

        const { executeReaction } = require('../services/index');
        const result = await executeReaction(
            reactionSlug, 
            area.reaction_params || {}, 
            token, 
            userId 
        );
        
        await supabaseAdmin
            .from('areas')
            .update({ 
                last_executed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', areaId);

        if (result === false) {
             return res.status(400).json({ 
                error: `Echec de l'exécution de la réaction: ${reactionSlug}`
            });
        }

        res.status(200).json({ 
            message: 'AREA test executed successfully',
            reaction: reactionSlug
        });

    } catch (error) {
        console.error('Test AREA error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Vérifier et déclencher une AREA (Legacy)
 */
exports.triggerAreaCheck = async (req, res) => {
    const userId = req.user.id;
    const { areaId } = req.params;
    try {
        const { data: area, error } = await supabase
            .from('areas')
            .select(`*, actions(name, services(slug)), reactions(name, services(slug))`)
            .eq('id', areaId).eq('user_id', userId).single();

        if (error || !area) return res.status(404).json({ error: 'AREA not found' });

        const actionSlug = `${area.actions.services.slug}_${area.actions.name}`;
        const reactionSlug = `${area.reactions.services.slug}_${area.reactions.name}`;
        
        const { executeAction, executeReaction } = require('../services/index');
        const actionTriggered = await executeAction(actionSlug, area.action_params || {});
        
        let result = { actionTriggered };
        if (actionTriggered) {
            await executeReaction(reactionSlug, area.reaction_params || {});
            await supabase.from('areas').update({ last_executed_at: new Date().toISOString() }).eq('id', areaId);
            result.message = 'Action triggered';
        } else {
            result.message = 'Action did not trigger';
        }
        res.status(200).json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

