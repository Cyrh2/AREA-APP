const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: POST /auth/register
router.post('/register', authController.register);
// Route: POST /auth/login
router.post('/login', authController.login);

// Route: PUT /auth/user
router.put('/user', authController.updateUser);
// Route: DELETE /auth/user
router.delete('/user', authController.deleteUser);

// Route: POST /auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);
// Route: POST /auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;