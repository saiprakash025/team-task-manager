// src/routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const userDoc = await User.create({ 
        name, email, password_hash 
      });

      const payload = { id: userDoc._id, email: userDoc.email, global_role: userDoc.global_role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ token, user: payload });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      
      const userDoc = await User.findOne({ email });
      if (!userDoc) return res.status(400).json({ message: 'Invalid credentials' });

      
      const isMatch = await bcrypt.compare(password, userDoc.password_hash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const payload = { id: userDoc._id, email: userDoc.email, global_role: userDoc.global_role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });


      res.json({ token, user: payload });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;