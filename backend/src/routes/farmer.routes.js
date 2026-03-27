const express = require('express');
const router = express.Router();

const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { apiLimiter, uploadLimiter } = require('../middlewares/rateLimiter.middleware');
const uploadConfig = require('../middlewares/upload.middleware');
const { logAction } = require('../middlewares/auditLog.middleware');

const farmerController = require('../controllers/farmer.controller');
const documentController = require('../controllers/document.controller');
const schemeController = require('../controllers/scheme.controller');
const applicationController = require('../controllers/application.controller');
const grievanceController = require('../controllers/grievance.controller');
const notificationController = require('../controllers/notification.controller');

// All endpoints require farmer role and general API rate limiting
router.use(requireAuth);
router.use(requireRole(['farmer']));
router.use(apiLimiter);

// Profile
router.get('/profile', farmerController.getProfile);
router.put('/profile', logAction('UPDATE_PROFILE', 'Farmer'), farmerController.updateProfile);

// Dashboard
router.get('/dashboard', farmerController.getDashboard);

// Documents
router.get('/documents', documentController.getDocuments);
router.post('/documents/upload', uploadLimiter, uploadConfig.single('file'), logAction('UPLOAD_DOCUMENT', 'Document'), documentController.uploadDocument);

// Schemes
router.get('/schemes', schemeController.getSchemes);
router.get('/schemes/:schemeId', schemeController.getSchemeById);
router.post('/schemes/:schemeId/check-eligibility', schemeController.checkEligibility);

// Applications
router.get('/applications', applicationController.getApplications);
router.get('/applications/:applicationId', applicationController.getApplicationById);
router.post('/applications', logAction('SUBMIT_APPLICATION', 'Application'), applicationController.submitApplication);

// Grievances
router.get('/grievances', grievanceController.getGrievances);
router.get('/grievances/:grievanceId', grievanceController.getGrievanceById);
router.post('/grievances', logAction('SUBMIT_GRIEVANCE', 'Grievance'), grievanceController.submitGrievance);

// Notifications
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);

module.exports = router;
