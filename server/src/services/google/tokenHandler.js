// services/google/tokenHandler.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function refreshGoogleToken(userId, currentRefreshToken) {
    if (!currentRefreshToken) {
        console.error(`[ERROR] Pas de refresh token pour l'user ${userId}. Reconnexion requise.`);
        return null;
    }

    try {
        console.log(`[INFO] Rafraîchissement du token Google pour User ${userId}...`);

        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: currentRefreshToken,
            grant_type: 'refresh_token'
        });

        const newAccessToken = response.data.access_token;
        const newExpiresIn = response.data.expires_in;

        const { error } = await supabase
            .from('oauth_tokens')
            .update({
                access_token: newAccessToken,
                expires_at: new Date(Date.now() + newExpiresIn * 1000),
                updated_at: new Date()
            })
            .eq('user_id', userId)
            .eq('provider', 'google');

        if (error) {
            console.error("[ERROR] Impossible de sauvegarder le nouveau token en DB:", error);
        }

        console.log("[SUCCESS] Token Google rafraîchi avec succès !");
        return newAccessToken;

    } catch (error) {
        console.error("[CRITICAL] Échec du refresh token Google :", error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { refreshGoogleToken };
