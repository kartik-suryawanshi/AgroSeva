const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/scheme.controller');
const publicController = require('../controllers/public.controller');

// Public endpoints that don't require authentication
router.get('/schemes', schemeController.getSchemes);
router.get('/schemes/:schemeId', schemeController.getSchemeById);

// Public dashboard meta (for frontend rendering)
router.get('/dashboard/overview', publicController.getDashboardOverview);
router.get('/schemes/categories', publicController.getActiveSchemeCategories);

module.exports = router;
