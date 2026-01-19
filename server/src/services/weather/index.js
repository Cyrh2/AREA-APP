const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
    name: 'Weather',
    slug: 'weather',
    icon: 'cloud',

    actions: {
        // Trigger 1 : Condition spécifique (Pluie, Nuage...)
        condition: async (params) => {
            return await actions.check('weather_condition', params);
        },
        // Trigger 2 : Chute de température (Temp < Seuil)
        temp_drop: async (params) => {
            return await actions.check('weather_temp_drop', params);
        }
    },

    // Même si Weather n'a pas de vraies réactions, on garde une entrée pour éviter les erreurs
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
        log_weather: "Log weather info to console (Debugging)"
    }
};