const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.connectGithub = (req, res) => {
    const { userId, redirect } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "User ID manquant" });
    }

    const state = `${userId}|${redirect || 'web'}`;

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user&state=${state}`;

    res.redirect(githubAuthUrl);
};

exports.githubCallback = async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send("Erreur: Pas de code reçu de GitHub.");
    }

    try {
        const [userId, platform] = state.split('|');

        const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
            },
            { headers: { Accept: 'application/json' } }
        );

        const accessToken = response.data.access_token;

        if (!accessToken) {
            throw new Error("GitHub n'a pas renvoyé de token.");
        }

        const { error } = await supabase
            .from('oauth_tokens')
            .upsert({
                user_id: userId,
                provider: 'github',
                access_token: accessToken,
                updated_at: new Date()
            }, { onConflict: 'user_id, provider' });

        if (error) throw error;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (platform === 'web') {
            res.redirect(`${frontendUrl}/dashboard?service=github&status=success`);
        } else {
            res.redirect('area://dashboard?service=github&status=success');
        }

    } catch (error) {
        console.error('GitHub Auth Error:', error.message);
        res.redirect('http://localhost:5173/dashboard?service=github&status=error');
    }
};
