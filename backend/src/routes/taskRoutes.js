const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRequired } = require('../middlewares/auth');
const { loadProjectMember, requireProjectAdmin } = require('../middlewares/projectRole');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');

const router = express.Router();

router.get('/project/:projectId', authRequired, loadProjectMember, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assigned_to', '_id name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/project/:projectId',
  authRequired,
  loadProjectMember,
  requireProjectAdmin,
  [body('title').notEmpty().withMessage('Task title is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, assigned_to, status, priority, due_date } = req.body;

    try {
      if (assigned_to) {
        const member = await ProjectMember.findOne({
          project: req.params.projectId,
          user: assigned_to,
        });
        if (!member) {
          return res.status(400).json({ message: 'Assigned user is not a member of this project' });
        }
      }

      const task = await Task.create({
        project: req.params.projectId,
        title,
        description: description || '',
        assigned_to: assigned_to || undefined,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        due_date: due_date || undefined,
      });

      const populatedTask = await Task.findById(task._id).populate('assigned_to', '_id name email');
      res.status(201).json(populatedTask);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.patch('/:id', authRequired, async (req, res) => {
  const { title, description, status, assigned_to, priority, due_date } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await ProjectMember.findOne({
      project: task.project,
      user: req.user.id,
    });

    if (!membership) return res.status(403).json({ message: 'Not a member of this project' });

    if (membership.role !== 'ADMIN') {
      if (assigned_to || title || description || priority || due_date) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
    }

    if (assigned_to) {
      const assignedMember = await ProjectMember.findOne({
        project: task.project,
        user: assigned_to,
      });
      if (!assignedMember) {
        return res.status(400).json({ message: 'Assigned user is not a member of this project' });
      }
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.assigned_to = assigned_to !== undefined ? assigned_to || null : task.assigned_to;
    task.priority = priority ?? task.priority;
    task.due_date = due_date !== undefined ? due_date || null : task.due_date;

    await task.save();

    const updatedTask = await Task.findById(task._id).populate('assigned_to', '_id name email');
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await ProjectMember.findOne({
      project: task.project,
      user: req.user.id,
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only project admin can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;