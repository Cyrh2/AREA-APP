// services/youtube/reactions.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
// 👇 Vérifie le chemin (ex: '../google/tokenHandler')
const { refreshGoogleToken } = require('../google/tokenHandler'); 
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    execute: async (slug, params, token, userId) => {
        // console.log(`[DEBUG] YouTube Reaction Target: ${slug}`);

        // --- ANCIENNES RÉACTIONS (CONSERVÉES) ---
        if (slug === 'youtube_add_to_playlist' || slug === 'youtube_playlist_add') {
            return await addToPlaylist(params, token, userId);
        }
        if (slug === 'youtube_subscribe') {
            return await subscribeToChannel(params, token, userId);
        }

        // --- NOUVELLES RÉACTIONS (AJOUTÉES) ---
        if (slug === 'youtube_post_comment') {
            return await postComment(params, token, userId);
        }
        if (slug === 'youtube_create_playlist') {
            return await createPlaylist(params, token, userId);
        }
        if (slug === 'youtube_delete_playlist') {
            return await deletePlaylist(params, token, userId);
        }
        if (slug === 'youtube_delete_comment') {
            return await deleteComment(params, token, userId);
        }

        console.warn(`[WARN] Réaction YouTube inconnue: ${slug}`);
        return false;
    }
};

// ==========================================
// 1. ADD TO PLAYLIST (Existant)
// ==========================================
async function addToPlaylist(params, token, userId) {
    const { playlist_id, video_id } = params;

    if (!playlist_id || !video_id) {
        console.error("[ERROR] YouTube: Paramètres manquants pour Add Playlist.");
        return;
    }

    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet';
    const body = {
        snippet: {
            playlistId: playlist_id,
            resourceId: { kind: 'youtube#video', videoId: video_id }
        }
    };

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.post(url, body, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        console.log(`[SUCCESS] ✅ Vidéo ${video_id} ajoutée à la playlist ${playlist_id}`);
    });
}

// ==========================================
// 2. SUBSCRIBE TO CHANNEL (Existant)
// ==========================================
async function subscribeToChannel(params, token, userId) {
    let { channel_id } = params;
    if (!channel_id) return;

    // Nettoyage ID
    if (channel_id.includes('/channel/')) {
        channel_id = channel_id.split('/channel/')[1].split('/')[0].split('?')[0];
    }

    const url = 'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet';
    const body = {
        snippet: { resourceId: { kind: 'youtube#channel', channelId: channel_id } }
    };

    return await executeWithRefresh(userId, token, async (accessToken) => {
        try {
            await axios.post(url, body, {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
            });
            console.log(`[SUCCESS] ✅ Abonné à la chaîne ${channel_id}`);
        } catch (error) {
            // Si déjà abonné, on considère ça comme un succès
            if (error.response?.data?.error?.errors[0]?.reason === 'subscriptionDuplicate') {
                console.log(`[INFO] Déjà abonné à cette chaîne. Succès.`);
            } else {
                throw error; // On relance l'erreur pour le refresh token
            }
        }
    });
}

// ==========================================
// 3. POST COMMENT (Nouveau)
// ==========================================
async function postComment(params, token, userId) {
    const { video_id, text } = params;

    if (!video_id || !text) {
        console.error("[ERROR] YouTube: Paramètres manquants pour Commentaire.");
        return;
    }

    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet`;
    const body = {
        snippet: {
            videoId: video_id,
            topLevelComment: { snippet: { textOriginal: text } }
        }
    };

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.post(url, body, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[SUCCESS] 💬 Commentaire posté sur la vidéo ${video_id}`);
    });
}

// ==========================================
// 4. CREATE PLAYLIST (Nouveau)
// ==========================================
async function createPlaylist(params, token, userId) {
    const { title, description } = params;

    if (!title) {
        console.error("[ERROR] YouTube: Titre manquant pour Create Playlist.");
        return;
    }

    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,status`;
    const body = {
        snippet: {
            title: title,
            description: description || "Created by AREA"
        },
        status: { privacyStatus: 'private' } // Privé par défaut
    };

    return await executeWithRefresh(userId, token, async (accessToken) => {
        const res = await axios.post(url, body, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`[SUCCESS] 📂 Playlist créée : "${res.data.snippet.title}"`);
    });
}

// ==========================================
// 5. DELETE PLAYLIST (Nouveau)
// ==========================================
async function deletePlaylist(params, token, userId) {
    const { playlist_id } = params;
    if (!playlist_id) return;

    const url = `https://www.googleapis.com/youtube/v3/playlists?id=${playlist_id}`;

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.delete(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        console.log(`[SUCCESS] 🗑️ Playlist ${playlist_id} supprimée.`);
    });
}

// ==========================================
// 6. DELETE COMMENT (Nouveau)
// ==========================================
async function deleteComment(params, token, userId) {
    const { comment_id } = params;
    if (!comment_id) return;

    const url = `https://www.googleapis.com/youtube/v3/comments?id=${comment_id}`;

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.delete(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        console.log(`[SUCCESS] 🗑️ Commentaire ${comment_id} supprimé.`);
    });
}

// ==========================================
// HELPER CENTRALISÉ (Refresh Token Auto)
// ==========================================
async function executeWithRefresh(userId, token, apiCall) {
    try {
        await apiCall(token);
        return true;
    } catch (error) {
        // GESTION ERREUR 401 (Refresh Token)
        if (error.response && error.response.status === 401) {
            console.log(`[WARN] Token YouTube expiré (User ${userId}). Tentative de refresh...`);
            
            const { data: tokenData } = await supabase
                .from('oauth_tokens').select('refresh_token')
                .eq('user_id', userId).eq('provider', 'google').single();

            if (tokenData?.refresh_token) {
                const newToken = await refreshGoogleToken(userId, tokenData.refresh_token);
                if (newToken) {
                    try {
                        // Retry avec le nouveau token
                        await apiCall(newToken);
                        console.log(`[SUCCESS] Action YouTube réussie après refresh.`);
                        return true;
                    } catch (retryError) {
                        console.error("[CRITICAL] Echec YouTube après refresh:", retryError.response?.data || retryError.message);
                    }
                }
            }
        } else {
            // Autres erreurs (400, 404, etc.)
            console.error("[ERROR] YouTube API Failed:", error.response?.data?.error?.message || error.message);
        }
        return false;
    }
}
