// services/youtube/actions.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
// 👇 Vérifie le chemin
const { refreshGoogleToken } = require('../google/tokenHandler'); 
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    check: async (slug, params, token, lastExecutedAt, userId) => {
        
        // 1. LIKE (Playlist LL)
        if (slug === 'youtube_new_liked_video' || slug === 'youtube_liked_video') {
            return await checkLikedVideo(params, token, lastExecutedAt, userId);
        }

        // 2. SUBSCRIPTION (Corrigé)
        if (slug === 'youtube_new_subscription') {
            return await checkNewSubscription(params, token, lastExecutedAt, userId);
        }

        return false;
    }
};

// ============================================================
// FONCTION 1 : LIKED VIDEOS (Inchangée)
// ============================================================
async function checkLikedVideo(params, token, lastExecutedAt, userId) {
    if (!token) return false;
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=1&playlistId=LL`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const items = response.data.items;
        if (!items || items.length === 0) return false;

        const latestItem = items[0];
        const videoTitle = latestItem.snippet.title;
        const likeDate = new Date(latestItem.snippet.publishedAt).getTime(); 

        if (!lastExecutedAt) return false;
        const lastCheck = new Date(lastExecutedAt).getTime();

        if (likeDate > lastCheck) {
            console.log(`[SUCCESS] 👍 YouTube Like: "${videoTitle}"`);
            params.video_title = videoTitle;
            params.video_link = `https://www.youtube.com/watch?v=${latestItem.snippet.resourceId.videoId}`;
            params.channel_name = latestItem.snippet.videoOwnerChannelTitle;
            return true;
        }
        return false;
    } catch (error) {
        await handleYouTubeError(error, userId, token);
        return false;
    }
}

// ============================================================
// FONCTION 2 : NOUVEL ABONNEMENT (CORRIGÉE)
// ============================================================
async function checkNewSubscription(params, token, lastExecutedAt, userId) {
    if (!token) return false;

    // ❌ ON RETIRE 'order=date' qui causait l'erreur 400
    // ✅ On demande 'maxResults=50' pour avoir une large liste et trier nous-mêmes
    const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const items = response.data.items;
        
        if (!items || items.length === 0) {
            return false;
        }

        // TRI MANUEL : On trie les abonnements du plus récent au plus vieux
        // (snippet.publishedAt contient la date d'abonnement)
        items.sort((a, b) => {
            return new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt);
        });

        // On prend le premier (le plus récent après tri)
        const latestSub = items[0];
        
        const channelTitle = latestSub.snippet.title;
        const subDate = new Date(latestSub.snippet.publishedAt).getTime();

        if (!lastExecutedAt) return false;
        const lastCheck = new Date(lastExecutedAt).getTime();

        // Comparaison
        if (subDate > lastCheck) {
            console.log(`[SUCCESS] 🔔 YouTube Subscription: "${channelTitle}"`);

            params.channel_name = channelTitle;
            params.channel_link = `https://www.youtube.com/channel/${latestSub.snippet.resourceId.channelId}`;
            params.video_title = `Nouvel abonnement : ${channelTitle}`; 

            return true;
        }
        return false;

    } catch (error) {
        await handleYouTubeError(error, userId, token);
        return false;
    }
}

// ============================================================
// HELPER GESTION ERREUR
// ============================================================
async function handleYouTubeError(error, userId, token) {
    if (error.response && error.response.status === 401) {
        console.log(`[WARN] Token YouTube expiré (User ${userId}). Refresh...`);
        const { data: tokenData } = await supabase
            .from('oauth_tokens').select('refresh_token')
            .eq('user_id', userId).eq('provider', 'google').single();

        if (tokenData?.refresh_token) {
            const newToken = await refreshGoogleToken(userId, tokenData.refresh_token);
            if (newToken) console.log("[INFO] Token rafraîchi pour le prochain cycle.");
        }
    } else {
        // Affiche l'erreur complète pour débugger si besoin
        console.error(`[ERROR] YouTube API:`, error.response ? error.response.data : error.message);
    }
}
