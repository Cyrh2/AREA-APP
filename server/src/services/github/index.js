// services/github/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'GitHub',
    slug: 'github',
    icon: 'github',

    actions: {
        push: async (params, token, userId) => {
            return await actions.check('github_push', params, token, null);
        },
        pr_created: async (params, token, userId) => {
            return await actions.check('github_pr_created', params, token, null);
        },
        issue_event: async (params, token, userId) => {
            return await actions.check('github_issue_event', params, token, null);
        },
        issue_created: async (params, token, userId) => { // <--- AJOUTÉ
            return await actions.check('github_issue_created', params, token, null);
        }
    },

    reactions: {
        // Cette clé correspond à "Create Issue" nettoyé par le contrôleur
        create_issue: async (params, token, userId) => {
            return await reactions.execute('github_create_issue', params, token, userId);
        },
        // Cette clé correspond à "Create & Assign Issue" nettoyé par le contrôleur
        issue_assigned: async (params, token, userId) => {
            return await reactions.execute('github_issue_assigned', params, token, userId);
        }
    },

    actionDescriptions: {
        push: "Trigger when a push is made to a repository",
        pr_created: "Trigger when a Pull Request is created",
        issue_event: "Trigger when an issue is opened or modified",
        issue_created: "Trigger when a new issue is created"
    },
    reactionDescriptions: {
        create_issue: "Create a new issue on a repository",
        issue_assigned: "Create a new issue and assign it to a user"
    }
};
