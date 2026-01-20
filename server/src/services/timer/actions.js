module.exports = {
    check: async (slug, params) => {
        const now = new Date();
        
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        if (slug === 'timer_daily') {
            if (!params.time) return false;
            return params.time === currentTime;
        }

        if (slug === 'timer_weekly') {
            if (params.day === undefined || !params.time) return false;
            
            const currentDay = now.getDay();
            return params.time === currentTime && params.day == currentDay;
        }

        if (slug === 'timer_monthly') {
            if (!params.day || !params.time) return false;

            const currentDate = now.getDate();
            return params.time === currentTime && params.day == currentDate;
        }

        return false;
    }
};