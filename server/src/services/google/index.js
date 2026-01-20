// services/google/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Google',
    slug: 'gmail', 
    icon: 'mail',
    
    actions: {
        received_email: async (params, token, userId) => {
            return await actions.check('gmail_received_email', params, token, null, userId);
        },
        subject_match: async (params, token, userId) => {
            return await actions.check('gmail_subject_match', params, token, null, userId);
        }
    },

    reactions: {
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
