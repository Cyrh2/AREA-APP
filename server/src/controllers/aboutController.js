// On remonte d'un dossier (..) pour aller chercher services/index.js
const { getAllServices } = require('../services/index'); 

exports.getAbout = (req, res) => {
    try {
        // 1. On récupère l'IP du client
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

        // 2. On récupère la liste via la fonction exportée par ton Fichier 1
        const services = getAllServices();

        // 3. On construit la réponse
        const aboutInfo = {
            client: {
                host: ip
            },
            server: {
                current_time: Math.floor(Date.now() / 1000), // Format Epoch
                services: services
            }
        };

        res.status(200).json(aboutInfo);

    } catch (error) {
        console.error('Error generating about.json:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};