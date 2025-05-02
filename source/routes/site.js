const express = require('express');
const router = express.Router();
const userAuth = require('../app/middlewares/userAuth');
const upload = require('../app/middlewares/upAvatar');


const siteController = require('../app/controllers/SiteController');

router.get('/search', siteController.searchResult);
router.post('/register', siteController.register);
router.get('/register', siteController.registerForm);
router.get('/logout', siteController.logout);
router.post('/login', siteController.login);
router.get('/login', siteController.loginForm);
router.get('/', siteController.index);

module.exports = router;
