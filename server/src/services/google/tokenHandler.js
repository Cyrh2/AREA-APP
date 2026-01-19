// services/google/tokenHandler.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// On initialise Supabase ici aussi pour pouvoir lire/écrire les tokens
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Fonction CRITIQUE : Rafraîchit le token d'accès via Google
 * @param {string} userId - L'ID de l'utilisateur dans TA base de données
 * @param {string} currentRefreshToken - Le jeton de rafraîchissement stocké
 */
async function refreshGoogleToken(userId, currentRefreshToken) {
    if (!currentRefreshToken) {
        console.error(`[ERROR] Pas de refresh token pour l'user ${userId}. Reconnexion requise.`);
        return null;
    }

    try {
        console.log(`[INFO] 🔄 Rafraîchissement du token Google pour User ${userId}...`);

        // 1. Demande à Google
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: currentRefreshToken,
            grant_type: 'refresh_token'
        });

        const newAccessToken = response.data.access_token;
        const newExpiresIn = response.data.expires_in; // Secondes

        // 2. Mise à jour en Base de Données
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
            // On renvoie quand même le token pour que l'action immédiate fonctionne
        }

        console.log("[SUCCESS] ✅ Token Google rafraîchi avec succès !");
        return newAccessToken;

    } catch (error) {
        console.error("[CRITICAL] ❌ Échec du refresh token Google :", error.response ? error.response.data : error.message);
        // Si le refresh token est révoqué (ex: user a changé son mdp Google), il faudra qu'il se reconnecte.
        return null;
    }
}

module.exports = { refreshGoogleToken };
