// server/src/services/discord/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Discord',
    slug: 'discord',
    icon: 'discord', // Assure-toi d'avoir l'icône dans ton front

    // 1. Définition des Actions (Triggers)
   actions: {
        // Changé de 'message_keyword' à 'message_keyword' pour matcher le slug final 'discord_message_keyword'
        message_keyword: async (params, token, userId) => {
            return await actions.check('discord_message_keyword', params);
        }
    },

    reactions: {
        // Changez la clé pour correspondre exactement à l'erreur (send_discord_message)
        send_message: async (params, token, userId) => {
            // Ici vous appelez votre fonction dans reactions.js
            // On peut garder le slug interne 'discord_send_message' ou le changer
            return await reactions.execute('discord_send_message', params, token, userId);
        }
    },

    // 3. Descriptions pour le Frontend (Génération dynamique)
    actionDescriptions: {
        message_keyword: "Déclenche l'AREA lorsqu'un message contenant un mot-clé spécifique est détecté."
    },
    reactionDescriptions: {
        send_message: "Le Bot envoie un message dans un salon textuel spécifique."
    }
};
