// services/google/reactions.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { refreshGoogleToken } = require('./tokenHandler'); // Ton fichier existant
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    execute: async (slug, params, token, userId) => {
        console.log(`[DEBUG] Gmail Reaction execute: '${slug}'`);

        // --- ACTION 1 : ENVOYER UN EMAIL ---
        // On garde tes anciens slugs pour la compatibilité
        if (slug === 'gmail_send_email') {
            return await sendEmail(params, token, userId);
        }

        // --- ACTION 2 : SUPPRIMER UN EMAIL (Mettre à la corbeille) ---
        // C'est ici que l'ID récupéré par le Trigger Anti-Scam arrive
        if (slug === 'gmail_delete_mail') {
            return await trashEmail(params, token, userId);
        }
        
        console.warn(`[WARN] Slug inconnu dans Google Reactions: ${slug}`);
        return false;
    }
};

/**
 * ACTION: Envoyer un email
 */
async function sendEmail(params, token, userId) {
    // Gestion des variantes de noms de paramètres
    const recipient = params.recipient || params.to;
    const emailSubject = params.subject || "Notification AREA";
    const emailBody = params.body || params.message || "Ceci est un message automatique.";

    if (!recipient) {
        console.error("[ERROR] Gmail Send: Destinataire manquant.");
        return false;
    }

    console.log(`[DEBUG] Préparation envoi mail à: ${recipient}`);

    // Construction du mail (Format MIME requis par Gmail)
    const utf8Subject = `=?utf-8?B?${Buffer.from(emailSubject).toString('base64')}?=`;
    const messageParts = [
        `To: ${recipient}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        emailBody
    ];
    const rawMessage = messageParts.join('\n');
    const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

    // On utilise le helper pour gérer l'appel API + le refresh token automatiquement
    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.post(url, { raw: encodedMessage }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[SUCCESS] ✅ Email envoyé avec succès à ${recipient}`);
    });
}

/**
 * ACTION: Mettre un email à la corbeille
 */
async function trashEmail(params, token, userId) {
    // L'ID vient du Trigger (gmail_detect_scam)
    const { message_id } = params;

    if (!message_id) {
        console.error("[ERROR] Gmail Delete: 'message_id' est manquant.");
        return false;
    }

    console.log(`[ACTION] Tentative de suppression du message ID: ${message_id}`);

    // Endpoint "trash" (plus sûr que delete définitif)
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message_id}/trash`;

    // On utilise le même helper, donc la suppression gère aussi le refresh token !
    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.post(url, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[SUCCESS] 🗑️ Email ${message_id} mis à la corbeille.`);
    });
}

/**
 * HELPER CENTRALISÉ : Exécute une requête et gère le Refresh Token
 * @param {string} userId - ID User
 * @param {string} token - Token actuel
 * @param {function} apiCall - Une fonction qui prend un token et fait l'appel Axios
 */
async function executeWithRefresh(userId, token, apiCall) {
    try {
        // Tentative 1 : Avec le token fourni par le contrôleur
        await apiCall(token);
        return true;

    } catch (error) {
        // Si erreur 401 (Token expiré / invalide)
        if (error.response && error.response.status === 401) {
            console.log(`[WARN] Token Gmail expiré (User ${userId}). Tentative de refresh...`);
            
            // 1. On cherche le refresh token en BDD
            const { data: tokenData } = await supabase
                .from('oauth_tokens')
                .select('refresh_token')
                .eq('user_id', userId)
                .eq('provider', 'google')
                .single();

            if (tokenData?.refresh_token) {
                // 2. On utilise ton fichier tokenHandler.js pour refresh
                const newToken = await refreshGoogleToken(userId, tokenData.refresh_token);
                
                if (newToken) {
                    try {
                        // 3. Retry : On relance l'action avec le NOUVEAU token
                        await apiCall(newToken);
                        console.log(`[SUCCESS] Action Gmail réussie après refresh.`);
                        return true;
                    } catch (retryError) {
                        console.error("[CRITICAL] Echec Gmail même après refresh:", retryError.response?.data || retryError.message);
                    }
                }
            } else {
                console.error("[ERROR] Impossible de refresh : Pas de refresh_token trouvé en base.");
            }
        } 
        // Gestion erreur 404 (Email introuvable / déjà supprimé)
        else if (error.response && error.response.status === 404) {
            console.error(`[ERROR] Ressource introuvable (Email déjà supprimé ?).`);
        } 
        // Autres erreurs
        else {
            console.error("[ERROR] Gmail API Failed:", error.response?.data || error.message);
        }
        return false;
    }
}
