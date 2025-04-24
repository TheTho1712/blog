const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');

router.get('/stored/dishes', meController.storedDishes);
router.get('/bin/dishes', meController.deletedDishes);

module.exports = router;
