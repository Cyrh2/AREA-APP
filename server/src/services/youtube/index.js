// server/src/services/youtube/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'YouTube',
    slug: 'youtube',
    icon: 'youtube',

    actions: {
        new_video: async (params, token, userId) => {
            return await actions.check('youtube_new_video', params, token, null, userId);
        },
        liked_video: async (params, token, userId) => {
            return await actions.check('youtube_liked_video', params, token, null, userId);
        },
        new_subscription: async (params, token, userId) => {
            return await actions.check('youtube_new_subscription', params, token, null, userId);
        }
    },

    reactions: {
        add_to_playlist: async (params, token, userId) => {
            return await reactions.execute('youtube_add_to_playlist', params, token, userId);
        },
        subscribe: async (params, token, userId) => {
            return await reactions.execute('youtube_subscribe', params, token, userId);
        },
        post_comment: async (params, token, userId) => {
            return await reactions.execute('youtube_post_comment', params, token, userId);
        },
        create_playlist: async (params, token, userId) => {
            return await reactions.execute('youtube_create_playlist', params, token, userId);
        },
        delete_playlist: async (params, token, userId) => {
            return await reactions.execute('youtube_delete_playlist', params, token, userId);
        },
        delete_comment: async (params, token, userId) => {
            return await reactions.execute('youtube_delete_comment', params, token, userId);
        }
    },

    actionDescriptions: {
        new_video: "Trigger when a channel uploads a video",
        liked_video: "Trigger when you like a video",
        new_subscription: "Trigger when you subscribe to a new channel"
    },
    reactionDescriptions: {
        add_to_playlist: "Add a video to a specific playlist",
        subscribe: "Subscribe to a YouTube channel",
        post_comment: "Post a comment on a video",
        create_playlist: "Create a new private playlist",
        delete_playlist: "Delete a specific playlist"
    }
};