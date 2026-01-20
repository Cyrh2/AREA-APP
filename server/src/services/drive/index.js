// services/drive/index.js
const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Google Drive',
    slug: 'google_drive',
    icon: 'google_drive',
    actions: {
        new_file: async (params, token, userId) => await actions.check('drive_new_file', params, token, userId),
        new_folder: async (params, token, userId) => await actions.check('drive_new_folder', params, token, userId),
    },
    reactions: {
        upload_text: async (params, token, userId) => await reactions.execute('google_drive_upload_text', params, token, userId),
        create_folder: async (params, token, userId) => await reactions.execute('google_drive_create_folder', params, token, userId),
        rename_file: async (params, token, userId) => await reactions.execute('google_drive_rename_file', params, token, userId)
    }
};