const { createClient } = require('@supabase/supabase-js');

// Importation des modules par service
const timerActions = require('./timer/actions');
const githubActions = require('./github/actions');
const githubReactions = require('./github/reactions');
const discordActions = require('./discord/actions');
const discordReactions = require('./discord/reactions');
const googleActions = require('./google/actions');
const googleReactions = require('./google/reactions');
const youtubeActions = require('./youtube/actions'); 
const youtubeReactions = require('./youtube/reactions');
const weatherActions = require('./weather/actions');
const driveActions = require('./drive/actions');
const driveReactions = require('./drive/reactions');

require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function startCron() {
    console.log("[INFO] Cron Job initialized. Running every 60 seconds.");

    setInterval(async () => {
        try {
            console.log(`[INFO] [${new Date().toISOString()}] Checking active areas...`);

            const { data: areas, error } = await supabase
                .from('areas')
                .select(`
        *, 
        actions (name, slug, services (slug)), 
        reactions (name, slug, services (slug))
    `)
                .eq('is_active', true);
            if (error) throw error;

            for (const area of areas) {
                await processArea(area);
            }

        } catch (err) {
            console.error("[ERROR] Cron loop failed:", err.message);
        }
    }, 60000);
}

async function processArea(area) {
    if (wasExecutedRecently(area.last_executed_at))
        return;

    let shouldTrigger = false;
    
    if (!area.actions || !area.reactions) {
        console.warn(`[WARN] Area ${area.id} has missing action/reaction data. Skipping.`);
        return;
    }

    const triggerSlug = area.actions.slug;

    try {
        // --- ACTIONS ---
        if (triggerSlug.startsWith('timer_')) {
            shouldTrigger = await timerActions.check(triggerSlug, area.action_params);
        } 
        else if (triggerSlug.startsWith('github_')) {
            const token = await getUserToken(area.user_id, 'github');
            if (token) {
                shouldTrigger = await githubActions.check(triggerSlug, area.action_params, token, area.last_executed_at);
            }
        }
        else if (triggerSlug.startsWith('weather_')) {
            shouldTrigger = await weatherActions.check(triggerSlug, area.action_params, null, area.last_executed_at);
        }
        else if (triggerSlug.startsWith('gmail_')) {
            const token = await getUserToken(area.user_id, 'google');
            if (token) {
                shouldTrigger = await googleActions.check(triggerSlug, area.action_params, token, area.last_executed_at, area.user_id);
            }
        }
        else if (triggerSlug.startsWith('youtube_')) {
            const token = await getUserToken(area.user_id, 'google');
            shouldTrigger = await youtubeActions.check(
                triggerSlug,
                area.action_params,
                token, 
                area.last_executed_at,
                area.user_id
            );
        }
        else if (triggerSlug.startsWith('discord_')) {
            const botToken = process.env.DISCORD_BOT_TOKEN;
            shouldTrigger = await discordActions.check(triggerSlug, area.action_params, botToken, area.last_executed_at);
        }
        else if (triggerSlug.startsWith('google_drive_')) {
            const token = await getUserToken(area.user_id, 'google');
            if (token) {
                shouldTrigger = await driveActions.check(
                    triggerSlug,
                    area.action_params,
                    token,
                    area.last_executed_at,
                    area.user_id
                );
            }
        }
        // --- RÉACTIONS ---
        if (shouldTrigger) {
            console.log(`[ACTION] 🔥 Triggering AREA ${area.id}`);
    
            const serviceSlug = area.reactions.services.slug;
            const reactionInternalSlug = area.reactions.slug;

            const fullReactionSlug = `${serviceSlug}_${reactionInternalSlug}`;

            const mergedParams = {
                ...area.action_params,
                ...area.reaction_params
            };

            console.log(`[DEBUG] Executing '${fullReactionSlug}'`);

            if (serviceSlug === 'discord') {
                await discordReactions.execute(fullReactionSlug, mergedParams);
            }
            else if (serviceSlug === 'gmail' || serviceSlug === 'google') {
                const token = await getUserToken(area.user_id, 'google');
                if (token) {
                    await googleReactions.execute(fullReactionSlug, mergedParams, token, area.user_id);
                }
            }
            else if (serviceSlug === 'youtube') {
                const token = await getUserToken(area.user_id, 'google');
                if (token) {
                    await youtubeReactions.execute(fullReactionSlug, mergedParams, token, area.user_id);
                }
            }
            else if (serviceSlug === 'github') {
                const token = await getUserToken(area.user_id, 'github');
                if (token) {
                    await githubReactions.execute(fullReactionSlug, mergedParams, token);
                }
            }
            else if (serviceSlug === 'google_drive' || serviceSlug === 'drive') {
                const token = await getUserToken(area.user_id, 'google');
                if (token) {
                    await driveReactions.execute(fullReactionSlug, mergedParams, token, area.user_id);
                }
            }
            else {
                console.warn(`[WARN] No routing found for service: ${serviceSlug}`);
            }

            await supabase.from('areas').update({ last_executed_at: new Date() }).eq('id', area.id);

            console.log(`[SUCCESS] Cycle finished for AREA ${area.id}`);

        } else if (!area.last_executed_at) {
            await supabase.from('areas').update({ last_executed_at: new Date() }).eq('id', area.id);
        }

    } catch (err) {
        console.error(`[CRITICAL ERROR] Failed to process AREA ${area.id}:`, err);
    }
}

function wasExecutedRecently(lastExecuted) {
    if (!lastExecuted) return false;
    const diff = new Date() - new Date(lastExecuted);
    return diff < 59000;
}

async function getUserToken(userId, provider) {
    const { data } = await supabase
        .from('oauth_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', provider)
        .single();
    return data ? data.access_token : null;
}

module.exports = { startCron };