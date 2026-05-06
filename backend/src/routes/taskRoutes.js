const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRequired } = require('../middlewares/auth');
const { loadProjectMember } = require('../middlewares/projectRole');
const Task = require('../models/Task');

const router = express.Router();

// GET /tasks/project/:projectId
router.get('/project/:projectId', authRequired, loadProjectMember, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /tasks/project/:projectId
router.post(
  '/project/:projectId',
  authRequired,
  loadProjectMember,
  [body('title').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, assigned_to, status, priority, due_date } = req.body;
    try {
      const task = await Task.create({
        project: req.params.projectId,
        title,
        description: description || undefined,
        assigned_to: assigned_to || undefined,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        due_date: due_date || undefined,
      });
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;