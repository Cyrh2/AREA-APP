const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Timer',
    slug: 'timer',
    icon: 'clock',
    
    actions: {
        // 1. Tous les jours à une heure précise
        daily: async (params) => {
            return await actions.check('timer_daily', params);
        },
        // 2. Un jour de la semaine précis (Lundi, Mardi...)
        weekly: async (params) => {
            return await actions.check('timer_weekly', params);
        },
        // 3. Un jour du mois précis (le 1er, le 15...)
        monthly: async (params) => {
            return await actions.check('timer_monthly', params);
        }
    },

    reactions: {
        // Une réaction simple pour debugger ou faire des tests
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