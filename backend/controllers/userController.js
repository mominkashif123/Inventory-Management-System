const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

class UserController {
  // Register new user
  static async register(req, res) {
    try {
      const { username, password, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
      }
      const hash = await bcrypt.hash(password, 10);
      const result = await User.create({ username, password_hash: hash, role });
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const adminUser = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: adminUser, action: 'create_user', details: JSON.stringify({ username, role }) });
      res.status(201).json({ success: true, data: result.data[0], message: 'User registered' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        await AuditLog.log({ user_id: null, action: 'login_failed', details: JSON.stringify({ username, reason: 'missing credentials' }) });
        return res.status(400).json({ success: false, error: 'Username and password are required' });
      }
      const result = await User.findByUsername(username);
      if (!result.success || result.rowCount === 0) {
        await AuditLog.log({ user_id: null, action: 'login_failed', details: JSON.stringify({ username, reason: 'user not found' }) });
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      const user = result.data[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        await AuditLog.log({ user_id: user.id, action: 'login_failed', details: JSON.stringify({ username, reason: 'wrong password' }) });
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      // Issue JWT
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
      await AuditLog.log({ user_id: user.id, action: 'login_success', details: JSON.stringify({ username }) });
      res.json({ success: true, token, data: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all users
  static async getAll(req, res) {
    try {
      const result = await User.findAll();
      if (!result.success) return res.status(500).json(result);
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update user role
  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role) return res.status(400).json({ success: false, error: 'Role is required' });
      const result = await User.updateRole(id, role);
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const adminUser = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: adminUser, action: 'update_user_role', details: JSON.stringify({ id, role }) });
      res.json({ success: true, data: result.data[0], message: 'Role updated' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete user
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await User.delete(id);
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const adminUser = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: adminUser, action: 'delete_user', details: JSON.stringify({ id }) });
      res.json({ success: true, data: result.data[0], message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

// JWT auth middleware
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  };
};

module.exports = { UserController, authMiddleware }; 