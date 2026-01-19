const axios = require('axios');
const querystring = require('querystring');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// URLs Officielles Discord
const DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';

// Scopes : identité, email, et gestion des serveurs (guilds)
const SCOPES = 'identify email guilds';

// 1. Démarrer la connexion
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

// 2. Le Callback
exports.discordCallback = async (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code) {
        return res.redirect('http://localhost:5173/dashboard?service=discord&status=error');
    }

    try {
        const [userId, platform] = state.split('|');

        // Préparation des données pour l'échange de token
        // Discord exige 'application/x-www-form-urlencoded'
        const tokenParams = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.DISCORD_CALLBACK_URL,
        });

        const response = await axios.post(DISCORD_TOKEN_URL, tokenParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Sauvegarde dans Supabase
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

        // Redirection finale
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const finalUrl = platform === 'web'
            ? `${frontendUrl}/dashboard?service=discord&status=success`
            : 'area://dashboard?service=discord&status=success';

        res.redirect(finalUrl);

    } catch (err) {
        console.error('Discord Auth Error:', err.response ? err.response.data : err.message);
        res.redirect('http://localhost:5173/dashboard?service=discord&status=error');
    }
};

// 3. Invitation du Bot
exports.inviteBot = (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required to invite the bot." });
    }

    // 1. Paramètres de l'URL
    const clientId = process.env.DISCORD_CLIENT_ID;
    
    // Permissions = 8 (ADMINISTRATOR). 
    // C'est le plus simple pour un projet étudiant, le bot pourra tout faire.
    const permissions = '8'; 
    
    const redirectUri = encodeURIComponent(process.env.DISCORD_CALLBACK_URL);
    
    // Le 'state' permet de se souvenir de QUI a invité le bot
    const state = `${userId}|web|bot_invite`;

    // 2. Construction de l'URL Discord officielle
    // Note bien : scope=bot
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot&redirect_uri=${redirectUri}&response_type=code&state=${state}`;

    // 3. On redirige l'utilisateur vers Discord
    res.redirect(url);

};
