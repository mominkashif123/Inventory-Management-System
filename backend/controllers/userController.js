const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
      res.status(201).json({ success: true, data: result.data[0], message: 'User registered' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log(username, password); 
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
      }
      const result = await User.findByUsername(username);
      if (!result.success || result.rowCount === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      const user = result.data[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      // For now, just return user info (no JWT/session)
      res.json({ success: true, data: { id: user.id, username: user.username, role: user.role } });
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
      res.json({ success: true, data: result.data[0], message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = UserController; 