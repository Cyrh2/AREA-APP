const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { refreshGoogleToken } = require('../google/tokenHandler'); 
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
    check: async (slug, params, token, lastExecutedAt, userId) => {
        console.log(`[DEBUG] Google Drive Trigger check: '${slug}'`);
        
        if (slug === 'google_drive_new_file') {
            return await checkNewFile(params, token, lastExecutedAt, userId);
        }

        if (slug === 'google_drive_new_folder') {
            return await checkNewFolder(params, token, lastExecutedAt, userId);
        }
       
        return false;
    }
};

async function checkNewFile(params, token, lastExecutedAt, userId) {
    if (!token) return false;
    
    const since = lastExecutedAt ? new Date(lastExecutedAt).toISOString() : new Date(Date.now() - 60000).toISOString();
    const query = encodeURIComponent(`createdTime > '${since}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name, webViewLink)&orderBy=createdTime desc`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const files = response.data.files;
        
        if (files && files.length > 0) {
            const latestFile = files[0];
            console.log(`[SUCCESS] Google Drive New File: "${latestFile.name}"`);
            
            params.file_name = latestFile.name;
            params.file_link = latestFile.webViewLink;
            params.file_id = latestFile.id;
            return true;
        }
        return false;
    } catch (error) {
        await handleDriveError(error, userId);
        return false;
    }
}

async function checkNewFolder(params, token, lastExecutedAt, userId) {
    if (!token) return false;

    const since = lastExecutedAt ? new Date(lastExecutedAt).toISOString() : new Date(Date.now() - 60000).toISOString();
    const query = encodeURIComponent(`createdTime > '${since}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name, webViewLink)&orderBy=createdTime desc`;

    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const folders = response.data.files;

        if (folders && folders.length > 0) {
            const latestFolder = folders[0];
            console.log(`[SUCCESS] Google Drive New Folder: "${latestFolder.name}"`);
            
            params.folder_name = latestFolder.name;
            params.folder_id = latestFolder.id;
            params.folder_link = latestFolder.webViewLink;
            return true;
        }
        return false;
    } catch (error) {
        await handleDriveError(error, userId);
        return false;
    }
}

async function handleDriveError(error, userId) {
    if (error.response && error.response.status === 401) {
        console.log(`[WARN] Token Google Drive expiré (User ${userId}). Refresh...`);
        const { data: tokenData } = await supabase
            .from('oauth_tokens').select('refresh_token')
            .eq('user_id', userId).eq('provider', 'google').single();

        if (tokenData?.refresh_token) {
            const newToken = await refreshGoogleToken(userId, tokenData.refresh_token);
            if (newToken) console.log("[INFO] Token rafraîchi via Drive Service.");
        }
    } else {
        console.error(`[ERROR] Google Drive API:`, error.response ? error.response.data : error.message);
    }
}