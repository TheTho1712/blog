const express = require('express');
const router = express.Router();

const adminController = require('../app/controllers/AdminController');

// Trang dashboard admin
router.delete('/:id', adminController.delete);
router.get('/dashboard', adminController.getDashboard);

module.exports = router;
