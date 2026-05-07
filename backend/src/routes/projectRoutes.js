const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRequired } = require('../middlewares/auth');
const { loadProjectMember, requireProjectAdmin } = require('../middlewares/projectRole');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

const router = express.Router();

router.post(
  '/',
  authRequired,
  [body('name').notEmpty().withMessage('Project name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;

    try {
      const project = await Project.create({
        name,
        description,
        owner: req.user.id,
      });

      await ProjectMember.create({
        project: project._id,
        user: req.user.id,
        role: 'ADMIN',
      });

      res.status(201).json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/', authRequired, async (req, res) => {
  try {
    const memberships = await ProjectMember.find({ user: req.user.id }).select('project role');
    const projectIds = memberships.map((m) => m.project);

    const projects = await Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 });

    const result = projects.map((project) => {
      const membership = memberships.find((m) => String(m.project) === String(project._id));
      return {
        ...project.toObject(),
        currentUserRole: membership?.role || 'MEMBER',
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:projectId', authRequired, loadProjectMember, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = await ProjectMember.find({ project: req.params.projectId })
      .populate('user', '_id name email global_role')
      .sort({ createdAt: -1 });

    res.json({
      project,
      currentUserRole: req.projectRole,
      members: members.map((m) => ({
        id: m._id,
        role: m.role,
        user: m.user,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:projectId/members', authRequired, loadProjectMember, requireProjectAdmin, async (req, res) => {
  const { email, role } = req.body;
  const memberRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

  if (!email) return res.status(400).json({ message: 'Member email is required' });

  try {
    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(404).json({ message: 'User not found with this email' });

    await ProjectMember.findOneAndUpdate(
      { project: req.params.projectId, user: userDoc._id },
      { role: memberRole },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Member added/updated',
      userId: userDoc._id,
      email: userDoc.email,
      role: memberRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;