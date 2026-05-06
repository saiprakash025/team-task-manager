const ProjectMember = require('../models/ProjectMember');

async function loadProjectMember(req, res, next) {
  const projectId = req.params.projectId || req.params.id;
  if (!projectId) return res.status(400).json({ message: 'Project id missing' });

  try {
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    req.projectRole = membership.role;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

function requireProjectAdmin(req, res, next) {
  if (req.projectRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin role required' });
  }
  next();
}

module.exports = { loadProjectMember, requireProjectAdmin };