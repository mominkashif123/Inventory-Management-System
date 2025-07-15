const express = require('express');
const { authMiddleware } = require('../controllers/userController');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all audit logs (admin only)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const result = await AuditLog.findAll();
    if (!result.success) return res.status(500).json(result);
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;