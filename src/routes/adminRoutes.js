const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllGrievances,
  assignGrievance,
  getStaffList
} = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/pending-users', getPendingUsers);
router.patch('/approve/:id', approveUser);
router.delete('/reject/:id', rejectUser);
router.get('/grievances', getAllGrievances);
router.patch('/assign/:id', assignGrievance);
router.get('/staff-list', getStaffList);

module.exports = router;
