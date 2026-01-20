// server/src/services/discord/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Discord',
    slug: 'discord',
    icon: 'discord',

    // Actions (Triggers)
    actions: {
        message_keyword: async (params, token, userId) => {
            return await actions.check('discord_message_keyword', params);
        }
    },

    reactions: {
        send_message: async (params, token, userId) => {
            return await reactions.execute('discord_send_message', params, token, userId);
        }
    },

    // Descriptions for Frontend
    actionDescriptions: {
        message_keyword: "Déclenche l'AREA lorsqu'un message contenant un mot-clé spécifique est détecté."
    },
    reactionDescriptions: {
        send_message: "Le Bot envoie un message dans un salon textuel spécifique."
    }
};
