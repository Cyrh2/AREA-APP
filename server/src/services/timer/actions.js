module.exports = {
    check: async (slug, params) => {
        const now = new Date();
        
        // On formate l'heure actuelle en "HH:MM"
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        // --- Cas 1 : Quotidien (Daily) ---
        if (slug === 'timer_daily') {
            // params.time doit être "14:30"
            if (!params.time) return false;
            return params.time === currentTime;
        }

        // --- Cas 2 : Hebdomadaire (Weekly) ---
        if (slug === 'timer_weekly') {
            // params.day : 0 (Dimanche) à 6 (Samedi)
            if (params.day === undefined || !params.time) return false;
            
            const currentDay = now.getDay(); 
            // On compare l'heure ET le jour de la semaine
            // (Le == permet de comparer "1" (string) et 1 (number))
            return params.time === currentTime && params.day == currentDay;
        }

        // --- Cas 3 : Mensuel (Monthly) ---
        if (slug === 'timer_monthly') {
            // params.day : 1 à 31
            if (!params.day || !params.time) return false;

            const currentDate = now.getDate();
            // On compare l'heure ET le jour du mois
            return params.time === currentTime && params.day == currentDate;
        }

        return false;
    }
};