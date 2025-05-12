const express = require('express');
const router = express.Router();
const upload = require('../app/middlewares/upAvatar');
const userAuth = require('../app/middlewares/userAuth');

const siteController = require('../app/controllers/SiteController');
const User = require('../app/models/User');

router.post('/reset-password', siteController.resetPassword);
router.get('/reset-password', siteController.resetPasswordForm);
router.post('/forgot-password', siteController.forgotPassword);
router.get('/forgot-password', siteController.forgotPasswordForm);
router.get('/search', siteController.searchResult);
router.post('/register', siteController.register);
router.get('/register', siteController.registerForm);
router.get('/logout', siteController.logout);
router.post('/login', siteController.login);
router.get('/login', siteController.loginForm);
router.get('/', siteController.index);

module.exports = router;
