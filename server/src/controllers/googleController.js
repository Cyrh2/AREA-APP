const axios = require('axios');
const querystring = require('querystring');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive'
].join(' ');

exports.connectGoogle = (req, res) => {
    const { userId, redirect } = req.query;

    if (!userId) return res.status(400).json({ error: "User ID manquant" });

    const state = `${userId}|${redirect || 'web'}`;

    const queryParams = querystring.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: SCOPES,
        state: state,
        access_type: 'offline',
        prompt: 'consent' 
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${queryParams}`);
};

exports.googleCallback = async (req, res) => {
    const { code, state, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    let platform = 'web';
    let userId = null;
    if (state) {
        const parts = state.split('|');
        userId = parts[0];
        platform = parts[1] || 'web';
    }

    if (error || !code) {
        if (platform === 'mobile') {
            return res.redirect(`area-app://google-error?status=error`);
        }
        return res.redirect(`${frontendUrl}/home?status=error&service=google`);
    }

    try {
        const response = await axios.post(GOOGLE_TOKEN_URL, {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL
        });

        const { access_token, refresh_token, expires_in } = response.data;

        const tokenData = {
            user_id: userId,
            provider: 'google',
            access_token: access_token,
            expires_at: new Date(Date.now() + expires_in * 1000),
            updated_at: new Date()
        };

        if (refresh_token) {
            tokenData.refresh_token = refresh_token;
        }

        const { error: dbError } = await supabase
            .from('oauth_tokens')
            .upsert(tokenData, { onConflict: 'user_id, provider' });

        if (dbError) throw dbError;

        
        if (platform === 'mobile') {
            return res.redirect(`area-app://google-success?userId=${userId}&status=success`);
        } else {
            return res.redirect(`${frontendUrl}/home?status=success&service=google`);
        }

    } catch (err) {
        console.error('Google Auth Error:', err.response ? err.response.data : err.message);
        
        if (platform === 'mobile') {
            return res.redirect(`area-app://google-error?status=error`);
        }
        res.redirect(`${frontendUrl}/home?status=error&service=google`);
    }
};