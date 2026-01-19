const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// On crée un client Supabase spécifiquement pour ce contrôleur
// ⚠️ On utilise la SERVICE_ROLE_KEY pour pouvoir écrire le token sans restriction RLS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// 1. Démarrer la connexion (Redirection vers GitHub)
exports.connectGithub = (req, res) => {
    // Le Frontend envoie l'ID de l'user (userId) et la plateforme (redirect)
    const { userId, redirect } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "User ID manquant" });
    }

    // On prépare l'état pour sécuriser et garder l'info user
    // Format: "ID_USER|URL_REDIRECTION"
    // Si redirect n'est pas fourni, on assume que c'est le web
    const state = `${userId}|${redirect || 'web'}`;

    // On construit l'URL officielle de GitHub
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user&state=${state}`;

    // On redirige l'utilisateur vers GitHub
    res.redirect(githubAuthUrl);
};

// 2. Le Callback (GitHub revient ici avec le code)
exports.githubCallback = async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send("Erreur: Pas de code reçu de GitHub.");
    }

    try {
        // A. On décode le "state" pour retrouver qui a fait la demande
        const [userId, platform] = state.split('|');

        // B. On échange le CODE temporaire contre un TOKEN permanent
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

        // C. On sauvegarde le token dans Supabase (Table oauth_tokens)
        const { error } = await supabase
            .from('oauth_tokens')
            .upsert({
                user_id: userId,
                provider: 'github',
                access_token: accessToken, // <--- CORRECTION : On utilise le bon nom de colonne SQL
                updated_at: new Date()
            }, { onConflict: 'user_id, provider' });

        if (error) throw error;

        // D. Redirection finale vers le Frontend
        // Dans githubCallback...

        // Au lieu de ça :
        // res.redirect('http://localhost:5173/dashboard?service=github&status=success');

        // Mets ça :
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (platform === 'web') {
            res.redirect(`${frontendUrl}/dashboard?service=github&status=success`);
        } else {
            // Pour le mobile, on garde le protocole spécial
            res.redirect('area://dashboard?service=github&status=success');
        }

    } catch (error) {
        console.error('GitHub Auth Error:', error.message);
        // En cas d'erreur, on renvoie quand même au front mais avec status=error
        res.redirect('http://localhost:5173/dashboard?service=github&status=error');
    }
};
