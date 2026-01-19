const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const supabase = require('./config/supabase');

    /* Initialisation de l'app */
const app = express();

    /* IMPORTATION DES ROUTES */
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const aboutController = require('./controllers/aboutController');
const areaRoutes = require('./routes/areaRoutes');
    /* Swagger pour la doc de l'api*/
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

    /* MIDDLEWARES GLOBAUX POUR LA SÉCURITÉ ET LE PARSING */
// Sécurité (Headers HTTP)
app.use(helmet());
// CORS (Autoriser le Web et le Mobile)
app.use(cors());
// Logging (Voir les requêtes dans la console)
app.use(morgan('dev'));
// Parsing du JSON (Vital pour lire les req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
    /* Documentation Swagger */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

    /* ---ROUTE DE TEST (Pour vérifier que ça marche) --- */
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to AREA API',
        status: 'OK',
        timestamp: new Date()
    });
});

    /* ---Route about.json (Obligatoire pour le projet) --- */
// Route about.json (Dynamique & Conforme PDF)
app.get('/about.json', aboutController.getAbout);


    /* --- ROUTES DE L'API --- */
// ROUTES D'AUTHENTIFICATION
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes)

// ROUTES DES AREAS
app.use('/areas', areaRoutes);

module.exports = app;
