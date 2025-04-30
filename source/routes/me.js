const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');
const userAuth = require('../app/middlewares/userAuth');

router.get('/stored/dishes', userAuth, meController.storedDishes);
router.get('/bin/dishes', meController.deletedDishes);

module.exports = router;
