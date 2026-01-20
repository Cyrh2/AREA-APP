const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { refreshGoogleToken } = require('../google/tokenHandler'); 
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    execute: async (slug, params, token, userId) => {
        if (slug === 'google_drive_upload_text' || slug === 'google_drive_upload_text_file') {
            return await uploadTextFile(params, token, userId);
        }
        if (slug === 'google_drive_create_folder') {
            return await createFolder(params, token, userId);
        }
        if (slug === 'google_drive_rename_file') {
            return await renameFile(params, token, userId);
        }

        console.warn(`[WARN] Réaction Google Drive inconnue: ${slug}`);
        return false;
    }
};

async function uploadTextFile(params, token, userId) {
    const fileName = params.filename || params.file_name || params.commit_message || "AREA_Update";
    const fileContent = params.content || params.message || params.repository_name || "Notification automatique AREA";

    const metadata = {
        name: `${fileName.substring(0, 30)}.txt`,
        mimeType: 'text/plain'
    };

    return await executeWithRefresh(userId, token, async (accessToken) => {
        const res = await axios.post('https://www.googleapis.com/drive/v3/files', metadata, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        const fileId = res.data.id;
        await axios.patch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, 
            fileContent, 
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'text/plain' } }
        );
        console.log(`[SUCCESS] Fichier créé via réaction croisée (ID: ${fileId})`);
    });
}

async function createFolder(params, token, userId) {
    const { folder_name } = params;

    const metadata = {
        name: folder_name || 'Nouveau Dossier AREA',
        mimeType: 'application/vnd.google-apps.folder'
    };

    return await executeWithRefresh(userId, token, async (accessToken) => {
        const res = await axios.post('https://www.googleapis.com/drive/v3/files', metadata, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        console.log(`[SUCCESS] Dossier créé : "${res.data.name}" (ID: ${res.data.id})`);
    });
}

async function renameFile(params, token, userId) {
    const { file_id, new_name } = params;

    if (!file_id || !new_name) {
        console.error("[ERROR] Drive: Paramètres manquants pour Rename.");
        return false;
    }

    return await executeWithRefresh(userId, token, async (accessToken) => {
        await axios.patch(`https://www.googleapis.com/drive/v3/files/${file_id}`, 
            { name: new_name }, 
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );
        console.log(`[SUCCESS] Fichier ${file_id} renommé en "${new_name}"`);
    });
}

async function executeWithRefresh(userId, token, apiCall) {
    try {
        await apiCall(token);
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log(`[WARN] Token Drive expiré (User ${userId}). Tentative de refresh...`);
            
            const { data: tokenData } = await supabase
                .from('oauth_tokens').select('refresh_token')
                .eq('user_id', userId).eq('provider', 'google').single();

            if (tokenData?.refresh_token) {
                const newToken = await refreshGoogleToken(userId, tokenData.refresh_token);
                if (newToken) {
                    try {
                        await apiCall(newToken);
                        console.log(`[SUCCESS] Action Drive réussie après refresh.`);
                        return true;
                    } catch (retryError) {
                        console.error("[CRITICAL] Echec Drive après refresh:", retryError.response?.data || retryError.message);
                    }
                }
            }
        } else {
            console.error("[ERROR] Google Drive API Failed:", error.response?.data?.error?.message || error.message);
        }
        return false;
    }
}
