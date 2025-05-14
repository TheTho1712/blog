const express = require('express');
const router = express.Router();
const adminAuth = require('../app/middlewares/adminAuth');

const adminController = require('../app/controllers/AdminController');

// Trang dashboard admin
router.post('/user/role/:id', adminController.changeUserRole);
router.get('/user/:id/info', adminController.getUserInfo);
router.post('/user/lock/:id', adminController.lockUser);
router.delete('/:id', adminController.delete);
router.get('/dashboard', adminController.getDashboard);

module.exports = router;
