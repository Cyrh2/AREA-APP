module.exports = {
    execute: async (slug, params) => {
        // Weather n'a pas vraiment de réaction physique, on simule un log
        if (slug === 'weather_log') {
            console.log(`[WEATHER LOG] ${params.message || "Weather info processed."}`);
            return true;
        }
        return false;
    }
};