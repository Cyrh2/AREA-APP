const axios = require('axios');
const querystring = require('querystring');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';

const SCOPES = 'identify email guilds';

exports.connectDiscord = (req, res) => {
    const { userId, redirect } = req.query;

    if (!userId) return res.status(400).json({ error: "User ID manquant" });

    const state = `${userId}|${redirect || 'web'}`;

    const queryParams = querystring.stringify({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_CALLBACK_URL,
        response_type: 'code',
        scope: SCOPES,
        state: state
    });

    res.redirect(`${DISCORD_AUTH_URL}?${queryParams}`);
};

exports.discordCallback = async (req, res) => {
    const { code, state, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error || !code) {
        return res.redirect(`${frontendUrl}/home?status=error&service=discord`);
    }

    try {
        const [userId, platform] = state.split('|');

        const tokenParams = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.DISCORD_CALLBACK_URL,
        });

        const response = await axios.post(DISCORD_TOKEN_URL, tokenParams, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        const { error: dbError } = await supabase
            .from('oauth_tokens')
            .upsert({
                user_id: userId,
                provider: 'discord',
                access_token: access_token,
                refresh_token: refresh_token,
                expires_at: expiresAt,
                updated_at: new Date()
            }, { onConflict: 'user_id, provider' });

        if (dbError) throw dbError;

        // --- REDIRECTION INTELLIGENTE ---
        if (platform === 'mobile') {
            return res.redirect(`area-app://discord-success?userId=${userId}&status=success`);
        } else {
            return res.redirect(`${frontendUrl}/home?status=success&service=discord`);
        }

    } catch (err) {
        console.error('Discord Auth Error:', err.response ? err.response.data : err.message);
        const platform = state ? state.split('|')[1] : 'web';
        
        if (platform === 'mobile') {
            return res.redirect(`area-app://discord-error?status=error`);
        }
        res.redirect(`${frontendUrl}/home?status=error&service=discord`);
    }
};

exports.inviteBot = (req, res) => {
    const { userId, redirect } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required to invite the bot." });
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const permissions = '8'; 
    const redirectUri = encodeURIComponent(process.env.DISCORD_CALLBACK_URL);
    
    const state = `${userId}|${redirect || 'web'}|bot_invite`;

    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot&redirect_uri=${redirectUri}&response_type=code&state=${state}`;

    res.redirect(url);
};