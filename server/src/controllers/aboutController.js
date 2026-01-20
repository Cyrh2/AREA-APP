const { getAllServices } = require('../services/index'); 

exports.getAbout = (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const services = getAllServices();
        const aboutInfo = {
            client: {
                host: ip
            },
            server: {
                // format epoch time in seconds
                current_time: Math.floor(Date.now() / 1000),
                services: services
            }
        };

        res.status(200).json(aboutInfo);

    } catch (error) {
        console.error('Error generating about.json:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};