const express = require('express');
const { authRequired } = require('../middlewares/auth');
const Task = require('../models/Task');

const router = express.Router();

router.get('/overview', authRequired, async (req, res) => {
  try {
    const tasksByStatus = await Task.aggregate([
      { $match: { assigned_to: req.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const overdueTasks = await Task.find({
      assigned_to: req.user.id,
      due_date: { $lt: new Date() },
      status: { $ne: 'DONE' },
    });

    res.json({
      tasksByStatus: tasksByStatus.map((t) => ({ status: t._id, count: t.count })),
      overdueTasks,
      totalAssigned: tasksByStatus.reduce((sum, t) => sum + t.count, 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;