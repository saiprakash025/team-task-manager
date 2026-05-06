const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRequired } = require('../middlewares/auth');
const { loadProjectMember, requireProjectAdmin } = require('../middlewares/projectRole');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');

const router = express.Router();

// Create project
router.post(
  '/',
  authRequired,
  [body('name').notEmpty()],
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

// list projects for log-in user
router.get('/', authRequired, async (req, res) => {
  try {
    const memberships = await ProjectMember.find({ user: req.user.id }).select('project');
    const projectIds = memberships.map((m) => m.project);

    const projects = await Project.find({ _id: { $in: projectIds } });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// add member
router.post('/:projectId/members', authRequired, loadProjectMember, requireProjectAdmin, async (req, res) => {
  const { userId, role } = req.body;
  const memberRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

  try {
    await ProjectMember.findOneAndUpdate(
      { project: req.params.projectId, user: userId },
      { role: memberRole },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Member added/updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;