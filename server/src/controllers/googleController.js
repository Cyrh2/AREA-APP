// controllers/googleController.js
const axios = require('axios');
const querystring = require('querystring');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// URLs Officielles Google
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Scopes : Identité + Gmail (Lecture/Écriture pour envoyer des mails)
// Scopes : Identité + Gmail + YOUTUBE (Nouveau !)
const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.modify',    // Pour Gmail
    'https://www.googleapis.com/auth/gmail.send', // <--- INDISPENSABLE
    'https://www.googleapis.com/auth/youtube',       // Pour YouTube (Like, Playlist, Sub)
    'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

// 1. Connexion
exports.connectGoogle = (req, res) => {
    const { userId, redirect } = req.query;

    if (!userId) return res.status(400).json({ error: "User ID manquant" });

    const state = `${userId}|${redirect || 'web'}`;

    const queryParams = querystring.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: SCOPES,
        state: state,
        access_type: 'offline', // ⚠️ OBLIGATOIRE pour avoir le refresh_token
        prompt: 'consent'       // ⚠️ Force Google à redemander l'accès pour garantir le refresh_token
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${queryParams}`);
};

// 2. Callback
exports.googleCallback = async (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code) {
        return res.redirect('http://localhost:5173/dashboard?service=google&status=error');
    }

    try {
        const [userId, platform] = state.split('|');

        // Échange du code contre le token
        const response = await axios.post(GOOGLE_TOKEN_URL, {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL
        });

        const { access_token, refresh_token, expires_in } = response.data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Sauvegarde BDD
        // Note : Google ne renvoie le refresh_token QUE la première fois.
        // On utilise donc un upsert qui ne l'écrase pas s'il est null.

        // 1. On prépare l'objet à insérer
        const tokenData = {
            user_id: userId,
            provider: 'google',
            access_token: access_token,
            expires_at: expiresAt,
            updated_at: new Date()
        };

        // 2. Si Google nous a donné un refresh_token (1ère connexion), on l'ajoute
        if (refresh_token) {
            tokenData.refresh_token = refresh_token;
        }

        const { error: dbError } = await supabase
            .from('oauth_tokens')
            .upsert(tokenData, { onConflict: 'user_id, provider' });

        if (dbError) throw dbError;

        // Redirection
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const finalUrl = platform === 'web'
            ? `${frontendUrl}/dashboard?service=google&status=success`
            : 'area://dashboard?service=google&status=success';

        res.redirect(finalUrl);

    } catch (err) {
        console.error('Google Auth Error:', err.response ? err.response.data : err.message);
        res.redirect('http://localhost:5173/dashboard?service=google&status=error');
    }
};
