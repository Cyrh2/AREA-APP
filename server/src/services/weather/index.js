const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Weather',
    slug: 'weather',
    icon: 'cloud',

    actions: {
        condition: async (params) => {
            return await actions.check('weather_condition', params);
        },
        temp_drop: async (params) => {
            return await actions.check('weather_temp_drop', params);
        }
    },

    reactions: {
        log_weather: async (params) => {
            return await reactions.execute('weather_log', params);
        }
    },

    actionDescriptions: {
        condition: "Trigger when weather matches a condition (Rain, Clear, Clouds...)",
        temp_drop: "Trigger when temperature drops below a specific threshold"
    },
    reactionDescriptions: {
        log_weather: "Log weather info to console"
    }
};