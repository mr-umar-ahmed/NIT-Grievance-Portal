const express = require('express');
const router = express.Router();
const {
  createGrievance,
  getMyGrievances,
  getAssignedToMe,
  getGrievance,
  resolveGrievance,
  reopenGrievance,
  closeGrievance
} = require('../controllers/GrievanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create', createGrievance);
router.get('/mine', getMyGrievances);
router.get('/assigned', getAssignedToMe);
router.get('/:id', getGrievance);
router.patch('/resolve/:id', resolveGrievance);
router.patch('/reopen/:id', reopenGrievance);
router.patch('/close/:id', closeGrievance);

module.exports = router;
