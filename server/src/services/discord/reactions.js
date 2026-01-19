// server/src/services/discord/reactions.js
const axios = require('axios');
require('dotenv').config(); // Pour récupérer le Token du Bot

module.exports = {
    execute: async (slug, params, token, userId) => {
        if (slug === 'discord_send_message') {
            return await sendMessage(params);
        }
        return false;
    }
};

async function sendMessage(params) {
    const { channel_id, message } = params;

    // Le Token du Bot est stocké dans le .env, pas besoin du token OAuth de l'utilisateur
    // car c'est le Bot lui-même qui parle.
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!channel_id || !message) {
        console.error("[ERROR] Discord Send Message: Paramètres manquants.");
        return false;
    }

    try {
        const url = `https://discord.com/api/v10/channels/${channel_id}/messages`;

        const response = await axios.post(
            url,
            { content: message },
            {
                headers: {
                    'Authorization': `Bot ${botToken}`, // Note le préfixe "Bot "
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`[SUCCESS] 🤖 Message Discord envoyé dans ${channel_id}`);
        return true;

    } catch (error) {
        console.error(
            "[ERROR] Discord Send Message Failed:", 
            error.response?.data?.message || error.message
        );
        return false;
    }
}