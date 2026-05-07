const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('global_role').isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, global_role } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const password_hash = await bcrypt.hash(password, 10);

      const userDoc = await User.create({
        name,
        email,
        password_hash,
        global_role,
      });

      const user = {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        global_role: userDoc.global_role,
      };

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('global_role').isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, global_role } = req.body;

    try {
      const userDoc = await User.findOne({ email });
      if (!userDoc) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, userDoc.password_hash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      if (userDoc.global_role !== global_role) {
        return res.status(400).json({ message: 'Selected role does not match this account' });
      }

      const user = {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        global_role: userDoc.global_role,
      };

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id name email global_role').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;