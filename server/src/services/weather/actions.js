const axios = require('axios');
require('dotenv').config();

module.exports = {
    check: async (slug, params) => {
        // Trigger 1 : Condition Météo
        if (slug === 'weather_condition') {
            return await checkWeatherCondition(params);
        }
        // Trigger 2 : Température (Ajouté)
        if (slug === 'weather_temp_drop') {
            return await checkTempDrop(params);
        }
        return false;
    }
};

const API_KEY = process.env.OPENWEATHER_API_KEY;

// --- FONCTION 1 : CONDITION ---
async function checkWeatherCondition(params) {
    const { city, condition } = params;
    
    if (!API_KEY || !city || !condition) {
        console.error("[ERROR] Weather: Missing API Key, City or Condition");
        return false;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        
        const weatherMain = response.data.weather[0].main; // Ex: "Rain", "Clear"
        
        // Debug léger
        // console.log(`[DEBUG] Weather in ${city}: ${weatherMain} (Target: ${condition})`);

        // Comparaison insensible à la casse
        if (weatherMain.toLowerCase() === condition.toLowerCase()) {
            return true;
        }
        return false;

    } catch (error) {
        console.error(`[ERROR] Weather API for ${city}:`, error.message);
        return false;
    }
}

// --- FONCTION 2 : TEMPÉRATURE ---
async function checkTempDrop(params) {
    const { city, threshold } = params;

    if (!API_KEY || !city || !threshold) return false;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        
        const currentTemp = response.data.main.temp;
        
        // Si la température est INFÉRIEURE au seuil (ex: 15°C)
        if (currentTemp < Number(threshold)) {
            console.log(`[SUCCESS] Alert! Temp in ${city} is ${currentTemp}°C (< ${threshold}°C)`);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}