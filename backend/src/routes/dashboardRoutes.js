const express = require('express');
const { authRequired } = require('../middlewares/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');

const router = express.Router();

router.get('/overview', authRequired, async (req, res) => {
  try {
    const memberships = await ProjectMember.find({ user: req.user.id }).select('project role');
    const projectIds = memberships.map((m) => m.project);

    const allProjectTasks = await Task.find({ project: { $in: projectIds } }).populate('assigned_to', '_id name email');
    const myAssignedTasks = await Task.find({ assigned_to: req.user.id }).populate('assigned_to', '_id name email');
    const projects = await Project.find({ _id: { $in: projectIds } });

    const tasksByStatusMap = {};
    myAssignedTasks.forEach((task) => {
      tasksByStatusMap[task.status] = (tasksByStatusMap[task.status] || 0) + 1;
    });

    const tasksByStatus = Object.entries(tasksByStatusMap).map(([status, count]) => ({ status, count }));

    const overdueTasks = myAssignedTasks.filter(
      (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
    );

    const adminProjectsCount = memberships.filter((m) => m.role === 'ADMIN').length;

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        global_role: req.user.global_role,
      },
      totalProjects: projects.length,
      adminProjectsCount,
      totalTasksInMyProjects: allProjectTasks.length,
      totalAssigned: myAssignedTasks.length,
      tasksByStatus,
      overdueTasks,
      recentAssignedTasks: myAssignedTasks.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;