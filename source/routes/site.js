const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.get('/dishes/:slug', siteController.dishDetail);
router.get('/search', siteController.searchResult);
// router.get('/test', siteController.test);
router.get('/introduce', siteController.introduce);
router.get('/register', siteController.register);
router.get('/logout', siteController.logout);
router.post('/login', siteController.login);
router.get('/login', siteController.loginForm);
router.get('/', siteController.index);

module.exports = router;
