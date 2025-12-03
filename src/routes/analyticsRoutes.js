const express = require('express');
const router = express.Router();
const {
  summary,
  categories,
  userType,
  monthly,
  exportCSV,
  exportPDF
} = require('../controllers/AnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/summary', summary);
router.get('/categories', categories);
router.get('/usertypes', userType);
router.get('/monthly', monthly);
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

module.exports = router;
