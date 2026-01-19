require('dotenv').config(); // Charge les variables du .env
const app = require('./app');
const PORT = process.env.PORT || 8080;
const { startCron } = require('./services/cron');
// Démarrer le moteur de tâches (Cron)
startCron();

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
    SERVER RUNNING
    -----------------------
    Port: ${PORT}
    Local: http://localhost:${PORT}
    -----------------------
    `);
});