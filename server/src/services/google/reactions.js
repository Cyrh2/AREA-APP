// services/google/reactions.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { refreshGoogleToken } = require('./tokenHandler'); 
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    execute: async (slug, params, token, userId) => {
        console.log(`[DEBUG] Gmail Reaction execute: '${slug}'`);

        if (slug === 'gmail_send_email') {
            return await sendEmail(params, token, userId);
        }

        if (slug === 'gmail_delete_mail') {
            return await trashEmail(params, token, userId);
        }
        
        console.warn(`[WARN] Slug inconnu dans Google Reactions: ${slug}`);
        return false;
    }
};

async function sendEmail(params, token, userId) {
    const recipient = params.recipient || params.to;
    const emailSubject = params.subject || "Notification AREA";
    const emailBody = params.body || params.message || "Ceci est un message automatique.";

    if (!recipient) {
        console.error("[ERROR] Gmail Send: Destinataire manquant.");
        return false;
    }

    console.log(`[DEBUG] Préparation envoi mail à: ${recipient}`);

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

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.post(url, { raw: encodedMessage }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[SUCCESS] Email envoyé avec succès à ${recipient}`);
    });
}

async function trashEmail(params, token, userId) {
    const { message_id } = params;

    if (!message_id) {
        console.error("[ERROR] Gmail Delete: 'message_id' est manquant.");
        return false;
    }

    console.log(`[ACTION] Tentative de suppression du message ID: ${message_id}`);

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message_id}/trash`;

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.post(url, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[SUCCESS] Email ${message_id} mis à la corbeille.`);
    });
}

async function executeWithRefresh(userId, token, apiCall) {
    try {
        await apiCall(token);
        return true;

    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log(`[WARN] Token Gmail expiré (User ${userId}). Tentative de refresh...`);
            
            const { data: tokenData } = await supabase
                .from('oauth_tokens')
                .select('refresh_token')
                .eq('user_id', userId)
                .eq('provider', 'google')
                .single();

            if (tokenData?.refresh_token) {
                const newToken = await refreshGoogleToken(userId, tokenData.refresh_token);
                
                if (newToken) {
                    try {
                        await apiCall(newToken);
                        console.log(`[SUCCESS] Action Gmail réussie après refresh.`);
                        return true;
                    } catch (retryError) {
                        console.error("[CRITICAL] Echec Gmail même après refresh:", retryError.response?.data || retryError.message);
                    }
                }
            } 
        } 
        else if (error.response && error.response.status === 404) {
            console.error(`[ERROR] Ressource introuvable (Email déjà supprimé ?).`);
        } 
        else {
            console.error("[ERROR] Gmail API Failed:", error.response?.data || error.message);
        }
        return false;
    }
}
