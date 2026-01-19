module.exports = {
    execute: async (slug, params) => {
        // Une réaction simple qui écrit dans la console du serveur
        if (slug === 'timer_log_message' || slug === 'timer_execute_reminder') {
            console.log(`[TIMER REACTION] 🔔 Notification: ${params.message || "Bip Bip!"}`);
            return true;
        }
        return false;
    }
};