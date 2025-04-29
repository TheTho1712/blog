const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');


router.post('/profile/delete', siteController.deleteAccount);
router.get('/profile/change-password', siteController.changePasswordForm);
router.post('/profile/change-password', siteController.changePassword);
router.get('/profile', siteController.profile);
router.get('/search', siteController.searchResult);
router.post('/register', siteController.register);
router.get('/register', siteController.registerForm);
router.get('/logout', siteController.logout);
router.post('/login', siteController.login);
router.get('/login', siteController.loginForm);
router.get('/', siteController.index);

module.exports = router;
