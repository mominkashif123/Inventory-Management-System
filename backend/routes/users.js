const express = require('express');
const { UserController, authMiddleware } = require('../controllers/userController');

const router = express.Router();

// Register new user
router.post('/register', UserController.register);

// Login
router.post('/login', UserController.login);

// Get all users (admin only)
router.get('/', authMiddleware(['admin']), UserController.getAll);

// Update user role
router.put('/:id/role', UserController.updateRole);

// Delete user
router.delete('/:id', UserController.delete);

module.exports = router;  