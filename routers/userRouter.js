const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetrPassword/:token', authController.resetPassword);

router.get('/me', authController.protect, userController.getMe);
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.addNewUser);
router
  .route('/:id')
  .get(authController.protect, userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
