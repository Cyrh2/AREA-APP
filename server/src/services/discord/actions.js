// server/src/services/discord/actions.js
const axios = require('axios');
require('dotenv').config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

module.exports = {
    check: async (slug, params) => {

        console.log(`[DEBUG] Discord Action Check: ${slug}`);

        if (slug === 'discord_message_keyword') {
            return await checkMessageKeyword(params);
        }
        return false;
    }
};

async function checkMessageKeyword(params) {
    const { channel_id, keyword } = params;

    if (!channel_id || !keyword) {
        console.log("[Trigger] Discord: Paramètres manquants (channel_id ou keyword)");
        return false;
    }

    try {
        const url = `https://discord.com/api/v10/channels/${channel_id}/messages?limit=1`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`
            }
        });
        if (response.data.length === 0)
            return false;
        const lastMessage = response.data[0];
        if (lastMessage.author.bot)
            return false;
        if (!lastMessage.content.includes(keyword)) {
            return false;
        }
        const messageTime = new Date(lastMessage.timestamp).getTime();
        const currentTime = new Date().getTime();
        const diffSeconds = (currentTime - messageTime) / 1000;
        if (diffSeconds < 90) {
            console.log(`[Trigger] 🤖 Mot-clé '${keyword}' détecté dans Discord !`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("[Trigger Error] Discord Check:", error.response?.data?.message || error.message);
        console.log(`[DEBUG] Channel ID: ${channel_id}`);
        return false;
    }
}
