const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signin', userController.signin);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/refreshToken', userController.refreshToken);
router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetrPassword/:token', authController.resetPassword);

router.get('/me', authMiddleware.protect, userController.getMe);
router.route('/').get(authMiddleware.protect, userController.getAllUsers);
// .post(userController.addNewUser);
// .get(authController.protect, userController.getAllUsers);
router.route('/:id').get(authMiddleware.protect, userController.getUser);
// .delete(authMiddleware.protect, userController.deleteUser);
//.patch(userController.updateUser)

module.exports = router;
