const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();
/**
 * @openapi
 * tags:
 *   name: Users
 *   description: Provides the user resource for the users.
 */
////////////////////////////////
/**
 * @openapi
 * /api/v1/users/signup:
 *   post:
 *     tags:
 *      - Users
 *     summary: Registers a new user in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/inputSignup'
 *     responses:
 *       201:
 *         description: Returns a success message and the user data in JSON format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Returns an error message.
 *                      User validation failed error if the input data are incorrect or duplicate key error if the user has already registered.
 */
router.post('/signup', body('email').isEmail(), userController.signup);
//////////////////////////////////////////////
/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     tags:
 *      - Users
 *     summary: Provides the user with access to application resources
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/inputLogin'
 *     responses:
 *       200:
 *         description: Returns a JSON message 'success' and cookies with access and refresh tokens.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Login'
 *       401:
 *         description: Returns an error message.
 *                      Please provide your password and email if they absend.
 *                      Data are incorrect if a user not registered.
 */
router.post('/login', userController.login);

////////////////////////////////////////////
/**
 * @openapi
 * /api/v1/users/logout:
 *   post:
 *     tags:
 *      - Users
 *     summary: Logouts the user
 *     responses:
 *       204:
 *         description: No content.
 */
router.post('/logout', userController.logout);
//////////////////////////////////////////////

router.get('/refreshToken', userController.refreshToken);
router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetrPassword/:token', authController.resetPassword);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags:
 *      - Users
 *     summary: Provides the user with the data on they
 *     responses:
 *       200:
 *         description: Returns the data on the user in JSON format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Returns an error message.
 *                      Refersh token. If Access token expired.
 */
router.get('/me', authMiddleware.protect, userController.getMe);
////////////////////////////////////////////////////////////////
/**
 * @openapi
 * /api/v1/users/:
 *   get:
 *     tags:
 *      - Users
 *     summary: Provides the user with the data on all users in the database
 *     responses:
 *       200:
 *         description: Returns an array of users in JSON format.
 *       401:
 *         description: Returns an error message.
 *                      Refersh token. If Access token expired.
 */
router.route('/').get(authMiddleware.protect, userController.getAllUsers);
/////////////////////////////////////////////////////////////////////////
/**
 * @openapi
 * /api/v1/users/{userId}:
 *   get:
 *     tags:
 *      - Users
 *     summary: Provides the user with the data on other user by ID
 *     parameters:
 *     - in: path
 *       name: userID
 *       required: true
 *       schema:
 *         type: integer
 *         minimun: 1
 *       description: The user ID
 *     responses:
 *       200:
 *         description: Returns a user object in a JSON message according to the supplied id.
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *       400:
 *         description: Retuns an error message. If a user is not in the database or expired access token.
 */
router.route('/:id').get(authMiddleware.protect, userController.getUser);

// .post(userController.addNewUser);
// .get(authController.protect, userController.getAllUsers);
// .delete(authMiddleware.protect, userController.deleteUser);
// .patch(userController.updateUser)

module.exports = router;
