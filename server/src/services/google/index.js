// services/google/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Google',
    // TRUC IMPORTANT : On met 'gmail' ici car dans ta DB tes slugs commencent par 'gmail_'
    // Si on mettait 'google', le registre créerait 'google_send_email' et ça ne matcherait pas avec la DB.
    slug: 'gmail', 
    icon: 'mail',
    
    // Définition des actions pour le registre dynamique
    actions: {
        received_email: async (params, token, userId) => {
            return await actions.check('gmail_received_email', params, token, null, userId);
        },
        subject_match: async (params, token, userId) => {
            return await actions.check('gmail_subject_match', params, token, null, userId);
        }
    },

    // Définition des réactions pour le registre dynamique
   
    reactions: {
        // Cette clé doit correspondre exactement au nom dans votre table 'reactions'
        delete_mail: async (params, token, userId) => {
            return await reactions.execute('gmail_delete_mail', params, token, userId);
        },
        send_email: async (params, token, userId) => {
            return await reactions.execute('gmail_send_email', params, token, userId);
        }
    },

    actionDescriptions: {
        received_email: "Trigger when a new email is received",
        subject_match: "Trigger when an email with specific subject is received"
    },
    reactionDescriptions: {
        send_email: "Send an email via Gmail"
    }
};
