// services/google/actions.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { refreshGoogleToken } = require('../google/tokenHandler'); 
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    check: async (slug, params, token, lastExecutedAt, userId) => {
        console.log(`[DEBUG] Gmail Trigger check: '${slug}'`);
        // Les autres actions existantes...
        if (slug === 'gmail_check_received' || slug === 'gmail_received_email') return await checkNewEmails(slug, params, token, lastExecutedAt, userId);
        if (slug === 'gmail_subject_match') return await checkNewEmails(slug, params, token, lastExecutedAt, userId);
        if (slug === 'gmail_has_attachment') {
            params.has_attachment = true;
            return await checkNewEmails(slug, params, token, lastExecutedAt, userId);
        }
        if (slug === 'gmail_body_match') {
            params.keyword = params.body_keyword;
            return await checkNewEmails(slug, params, token, lastExecutedAt, userId);
        }

        // --- NOUVEAU : DÉTECTEUR D'ARNAQUE ---
        if (slug === 'gmail_detect_scam') {
            return await checkNewEmails(slug, params, token, lastExecutedAt, userId);
        }

        return false;
    }
};

async function checkNewEmails(slug, params, token, lastExecutedAt, userId) {
    const { from_address, subject, keyword, has_attachment } = params;

    // 1. Gestion du Temps
    let afterTime = 0;
    if (lastExecutedAt) {
        afterTime = Math.floor(new Date(lastExecutedAt).getTime() / 1000) + 1;
    } else {
        afterTime = Math.floor((Date.now() - 120000) / 1000); 
    }

    // 2. Construction de la requête de base
    let query = `after:${afterTime} label:INBOX`; 
    
    // --- LOGIQUE SPÉCIALE ARNAQUE ---
    if (slug === 'gmail_detect_scam') {
        const scamKeywords = [
            "marabout",
            "retour affectif",
            "porte-feuille magique",
            "argent rapide",
            "gain garanti",
            "contactez-moi sur whatsapp",
            "rituel",
            "travail mystique"
        ];
        
        // On construit une requête : ("mot1" OR "mot2" OR "mot3")
        // Les guillemets permettent de chercher l'expression exacte (avec espaces)
        const orQuery = scamKeywords.map(word => `"${word}"`).join(' OR ');
        query += ` (${orQuery})`;
    }
    // -------------------------------

    if (from_address && from_address.trim() !== '') query += ` from:${from_address}`;
    if (subject && subject.trim() !== '') query += ` subject:(${subject})`;
    if (keyword && keyword.trim() !== '') query += ` "${keyword}"`;
    if (has_attachment) query += ` has:attachment`;

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const messages = response.data.messages || [];
        
        if (messages.length > 0) {
            console.log(`[SUCCESS] 🚨 Gmail Scam Detected! (${messages.length} found)`);
            
            // 🔥 C'EST ICI QUE TOUT SE JOUE 🔥
            // On injecte l'ID du message trouvé dans les 'params'.
            // Comme ça, la REACTION (Delete) pourra utiliser 'params.message_id' !
            params.message_id = messages[0].id;
            
            return true;
        }
        return false;

    } catch (error) {
        // ... (Ton code de gestion d'erreur/refresh token reste identique ici) ...
        console.error("[ERROR] Gmail API:", error.message); // Version courte pour l'exemple
        return false;
    }
}
