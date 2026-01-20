// server/src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs
const serviceController = require('../controllers/serviceController');
const githubController = require('../controllers/githubController');
const discordController = require('../controllers/discordController');
const googleController = require('../controllers/googleController');

// (Suppression de SpotifyController)

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Catalogue des services et OAuth
 */

// --- ROUTES DU CATALOGUE ---

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Récupérer la liste des services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/', serviceController.getAllServices);

/**
 * @swagger
 * /services/{serviceSlug}/actions/{actionName}/config:
 *   get:
 *     summary: Get configuration schema for a service action
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Service slug (e.g., weather)
 *       - in: path
 *         name: actionName
 *         required: true
 *         schema:
 *           type: string
 *         description: Action name (e.g., temperature_below)
 *     responses:
 *       200:
 *         description: Configuration schema
 *       404:
 *         description: Service or action not found
 */
router.get('/:serviceSlug/actions/:actionName/config', serviceController.getServiceConfig);

router.delete('/:provider', serviceController.disconnectService);


// --- GITHUB ---

/**
 * @swagger
 * /services/github/connect:
 *   get:
 *     summary: Démarrer l'OAuth GitHub
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: 
 *           type: string
 *       - in: query
 *         name: redirect
 *         schema: 
 *           type: string
 *           enum: [web, mobile]
 *     responses:
 *       302: 
 *         description: Redirection vers GitHub
 */
router.get('/github/connect', githubController.connectGithub);

router.get('/github/callback', githubController.githubCallback);

// --- DISCORD ---

/**
 * @swagger
 * /services/discord/connect:
 *   get:
 *     summary: Démarrer l'OAuth Discord
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: 
 *           type: string
 *       - in: query
 *         name: redirect
 *         schema: 
 *           type: string
 *     responses:
 *       302: 
 *         description: Redirection vers Discord
 */
router.get('/discord/connect', discordController.connectDiscord);
router.get('/discord/callback', discordController.discordCallback);
router.get('/discord/invite-bot', discordController.inviteBot);

// --- GOOGLE (GMAIL) ---

/**
 * @swagger
 * /services/google/connect:
 *   get:
 *     summary: Démarrer l'OAuth Google (Gmail)
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: 
 *           type: string
 *       - in: query
 *         name: redirect
 *         schema: 
 *           type: string
 *     responses:
 *       302: 
 *         description: Redirection vers Google
 */
router.get('/google/connect', googleController.connectGoogle);
router.get('/google/callback', googleController.googleCallback);
router.get('/gmail/connect', googleController.connectGoogle);

// --- YOUTUBE (Alias vers Google) ---

/**
 * @swagger
 * /services/youtube/connect:
 *   get:
 *     summary: Démarrer l'OAuth YouTube
 *     description: Utilise le compte Google pour activer YouTube.
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: 
 *           type: string
 *       - in: query
 *         name: redirect
 *         schema: 
 *           type: string
 *     responses:
 *       302: 
 *         description: Redirection vers Google Accounts
 */
router.get('/youtube/connect', googleController.connectGoogle);

// --- GOOGLE DRIVE (Alias vers Google) ---

/**
 * @swagger
 * /services/drive/connect:
 * get:
 * summary: Démarrer l'OAuth Google Drive
 * description: Utilise le compte Google pour activer les fonctionnalités Drive.
 * tags: [OAuth]
 * parameters:
 * - in: query
 * name: userId
 * required: true
 * schema: 
 * type: string
 * - in: query
 * name: redirect
 * schema: 
 * type: string
 * responses:
 * 302: 
 * description: Redirection vers Google Accounts
 */
router.get('/google_drive/connect', googleController.connectGoogle);
// router.get('/drive/connect', googleController.connectGoogle);

// AJOUTER CETTE LIGNE : Alias pour matcher l'URL du front-end
/**
 * @swagger
 * /services/my-connections:
 *   get:
 *     summary: Vérifier l'état des connexions aux services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: 
 *           type: string
 *     responses:
 *       200: 
 *         description: Succès
 */
router.get('/my-connections', serviceController.getUserServicesStatus);



module.exports = router;
