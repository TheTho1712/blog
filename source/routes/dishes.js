const express = require('express');
const router = express.Router();

const dishController = require('../app/controllers/DishController');

router.get('/create', dishController.create);
router.post('/store', dishController.store);
router.get('/:slug', dishController.show);

module.exports = router;
