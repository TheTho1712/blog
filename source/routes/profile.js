const express = require('express');
const router = express.Router();
const userAuth = require('../app/middlewares/userAuth');
const upload = require('../app/middlewares/upAvatar');


const profileController = require('../app/controllers/ProfileController');

router.post('/profile/delete-completed/:id', userAuth, profileController.deleteCompletedOne);
router.post('/profile/delete/:id', userAuth, profileController.deleteTask);
router.post('/profile/completed', userAuth, profileController.completeTask); // Hoàn thành task
router.post('/profile/delete-completed', profileController.deleteCompleted);
router.get('/profile/completed', userAuth, profileController.completeTasksForm);
router.post('/profile/edit', userAuth, profileController.editProfileForm);
router.post('/profile/delete-avatar', profileController.deleteAvatar);
router.get('/profile/change-avatar', userAuth, profileController.changeAvatarForm);
router.post('/profile/change-avatar', userAuth, upload.single('avatar'), profileController.changeAvatar);
router.post('/profile/delete', profileController.deleteAccount);
router.get('/profile/change-password', profileController.changePasswordForm);
router.post('/profile/change-password', profileController.changePassword);
router.get('/profile/info', userAuth, profileController.showUserActivity);
router.post('/profile', userAuth, profileController.addTask);
router.get('/profile', userAuth, profileController.profile);

module.exports = router;
