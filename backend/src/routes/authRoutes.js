// src/routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

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
      const db = getDB();
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)',
        [name, email, password_hash]
      );

      const user = { id: result.insertId, email, global_role: 'MEMBER' };
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
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const db = getDB();
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

      const userRow = rows[0];
      const isMatch = await bcrypt.compare(password, userRow.password_hash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const user = { id: userRow.id, email: userRow.email, global_role: userRow.global_role };
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;