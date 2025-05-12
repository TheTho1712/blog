const express = require('express');
const router = express.Router();
const userAuth = require('../app/middlewares/userAuth');
const uploadMany = require('../app/middlewares/expPicture');

const dishController = require('../app/controllers/DishController');

router.get('/create', dishController.create);
router.post('/store', uploadMany.array('images', 10), dishController.store);
router.get('/:id/edit', userAuth, dishController.edit);
router.post('/handle-form-actions', dishController.handleFormActions);
router.put('/:id', uploadMany.array('images', 10), dishController.update);
router.patch('/:id/restore', dishController.restore);
router.delete('/:id', dishController.delete);
router.delete('/:id/force', dishController.forceDelete);
router.get('/:slug', dishController.show);

module.exports = router;
