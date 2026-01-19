// server/src/controllers/spotifyController.js
const axios = require('axios');
const querystring = require('querystring');
const { createClient } = require('@supabase/supabase-js');
const { lstat } = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ LES VRAIES URLS OFFICIELLES (Vérifiées sur developer.spotify.com)
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private'
].join(' ');

// 1. Démarrer la connexion
exports.connectSpotify = (req, res) => {
    console.log('🎵 [Spotify] Démarrage connexion...');
    const { userId, redirect } = req.query;

    if (!userId) return res.status(400).json({ error: "User ID manquant" });

    // On s'assure d'utiliser l'URL Ngrok définie dans le .env
    const redirectUri = process.env.SPOTIFY_CALLBACK_URL;
    const state = `${userId}|${redirect || 'web'}`;

    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: redirectUri,
        state: state
    });

    // Redirection vers la VRAIE page de connexion Spotify
    const finalUrl = `${SPOTIFY_AUTH_URL}?${queryParams}`;
    console.log('🎵 [Spotify] Redirection vers:', finalUrl);
    
    res.redirect(finalUrl);
};

// 2. Le Callback
exports.spotifyCallback = async (req, res) => {
    console.log('🎵 [Spotify] Callback reçu !');
    const { code, state, error } = req.query;

    if (error || !code) {
        console.error('Erreur Spotify Callback:', error);
        return res.redirect('http://localhost:5173/dashboard?service=spotify&status=error');
    }

    try {
        const [userId, platform] = state.split('|');
        const redirectUri = process.env.SPOTIFY_CALLBACK_URL;

        const tokenParams = querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
        });

        // Encodage ClientID:ClientSecret en Base64
        const authHeader = Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64');

        console.log('🎵 [Spotify] Échange du token via accounts.spotify.com...');

        // Appel à la VRAIE API Spotify
        const response = await axios.post(SPOTIFY_TOKEN_URL, tokenParams, {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('🎵 [Spotify] Token reçu avec succès !');

        const { access_token, refresh_token, expires_in } = response.data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Sauvegarde dans Supabase
        const { error: dbError } = await supabase
            .from('oauth_tokens')
            .upsert({
                user_id: userId,
                provider: 'spotify',
                access_token: access_token,
                refresh_token: refresh_token,
                expires_at: expiresAt,
                updated_at: new Date()
            }, { onConflict: 'user_id, provider' });

        if (dbError) throw dbError;

        console.log('🎵 [Spotify] Sauvegardé en BDD. Redirection...');

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const finalUrl = platform === 'web' 
            ? `${frontendUrl}/dashboard?service=spotify&status=success`
            : 'area://dashboard?service=spotify&status=success';
            
        res.redirect(finalUrl);

    } catch (err) {
        // Affiche l'erreur exacte renvoyée par Spotify
        console.error('🎵 [Spotify] ERREUR API:', err.response ? err.response.data : err.message);
        res.redirect('http://localhost:5173/dashboard?service=spotify&status=error');
    }
};