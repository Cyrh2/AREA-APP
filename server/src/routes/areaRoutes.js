const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Toutes les routes ici sont protégées par le Token
router.use(authMiddleware);

/**
 * Routes pour la gestion des AREAs - CRUD AREAs
 */
router.post('/', areaController.createArea);
router.get('/', areaController.getUserAreas);
router.put('/:id', areaController.updateArea);
router.delete('/:id', areaController.deleteArea);

/** Routes pour tester et déclencher les AREAs
 */
router.post('/:areaId/test', areaController.testArea);          
router.post('/:areaId/trigger', areaController.triggerAreaCheck);


module.exports = router;