const express = require('express');
const router = express.Router();

const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { apiLimiter } = require('../middlewares/rateLimiter.middleware');
const { logAction } = require('../middlewares/auditLog.middleware');

const adminController = require('../controllers/admin.controller');
const appController = require('../controllers/admin.application.controller');
const grievanceController = require('../controllers/admin.grievance.controller');

const adminFarmerController = require('../controllers/admin.farmer.controller');
const adminSchemeController = require('../controllers/admin.scheme.controller');

// Need to create admin.scheme.controller and admin.farmer.controller separately to avoid file size limits here.
// But for now, let's tie what we have.

router.use(requireAuth);
router.use(requireRole(['official', 'admin']));
router.use(apiLimiter);

// System Dashboard
router.get('/dashboard', adminController.getDashboard);

// Reporting & Analytics
router.get('/reports/analytics', adminController.getAnalytics);
router.get('/reports/predictions', adminController.getPredictions);
router.post('/reports/export', adminController.exportReport);
router.get('/reports/export/:jobId', adminController.getExportStatus);

// Applications
router.get('/applications', appController.getApplications);
router.get('/applications/:applicationId', appController.getApplicationById);
router.put('/applications/:applicationId/status', logAction('UPDATE_APP_STATUS', 'Application'), appController.updateStatus);
router.put('/applications/:applicationId/assign', logAction('ASSIGN_APP', 'Application'), appController.assignApplication);
router.put('/applications/:applicationId/eligibility-override', logAction('ELIGIBILITY_OVERRIDE', 'Application'), appController.eligibilityOverride);

// Documents Verification
router.get('/documents/pending-verification', appController.getPendingDocuments);
router.put('/documents/:documentId/verify', logAction('VERIFY_DOCUMENT', 'Document'), appController.verifyDocument);

// Grievances
router.get('/grievances', grievanceController.getGrievances);
router.put('/grievances/:grievanceId/reply', logAction('REPLY_GRIEVANCE', 'Grievance'), grievanceController.replyToGrievance);
router.put('/grievances/:grievanceId/assign', logAction('ASSIGN_GRIEVANCE', 'Grievance'), grievanceController.assignGrievance);

// Farmers
router.get('/farmers', adminFarmerController.getFarmers);
router.get('/farmers/:farmerId', adminFarmerController.getFarmerById);

// Schemes
router.get('/schemes', adminSchemeController.getSchemes);
router.post('/schemes', logAction('CREATE_SCHEME', 'Scheme'), adminSchemeController.createScheme);
router.put('/schemes/:schemeId', logAction('UPDATE_SCHEME', 'Scheme'), adminSchemeController.updateScheme);
router.put('/schemes/:schemeId/publish', logAction('PUBLISH_SCHEME', 'Scheme'), adminSchemeController.publishScheme);

// Fraud Scanner — Manual Trigger
router.post('/reports/trigger-fraud-scan', async (req, res) => {
  try {
    const { runFraudScanner } = require('../cron/fraudScanner');
    // fire and forget — don't await on the full batch
    runFraudScanner().catch(e => console.error('Manual fraud scan failed', e.message));
    res.json({ success: true, message: 'Fraud scan queued and running in background.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
