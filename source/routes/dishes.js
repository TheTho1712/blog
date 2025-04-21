const express = require('express');
const router = express.Router();

const dishController = require('../app/controllers/DishController');


router.get('/create', dishController.create);
router.post('/store', dishController.store);
router.get('/:id/edit', dishController.edit);
router.put('/:id', dishController.update);
router.delete('/:id', dishController.delete);
router.get('/:slug', dishController.show);

module.exports = router;
