const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Timer',
    slug: 'timer',
    icon: 'clock',
    
    actions: {
        daily: async (params) => {
            return await actions.check('timer_daily', params);
        },
        weekly: async (params) => {
            return await actions.check('timer_weekly', params);
        },
        monthly: async (params) => {
            return await actions.check('timer_monthly', params);
        }
    },

    reactions: {
        log_message: async (params) => {
            return await reactions.execute('timer_log_message', params);
        }
    },

    actionDescriptions: {
        daily: 'Trigger daily at a specific time (HH:MM)',
        weekly: 'Trigger on a specific weekday (0=Sunday, 1=Monday...) at HH:MM',
        monthly: 'Trigger on a specific day of the month (1-31) at HH:MM'
    },
    reactionDescriptions: {
        log_message: 'Log a message to the server console (useful for testing)'
    }
};