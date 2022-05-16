/**
 * @openapi
 * components:
 *  schemas:
 *    Login:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          description: The user email.
 *          example: 'user@mail.com'
 *    User:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: The user ID.
 *          example: '62807bcbed5c1b1c03d848c2'
 *        name:
 *          type: string
 *          description: The user name.
 *          example: 'Ivan'
 *        email:
 *          type: string
 *          description: The user email.
 *          example: 'user@mail.com'
 *        role:
 *          type: string
 *          description: The user role.
 *          example: 'user'
 *    inputSignup:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The user name.
 *          example: 'Ivan'
 *        email:
 *          type: string
 *          description: The user email.
 *          example: 'user@mail.com'
 *        password:
 *          type: string
 *          description: The user password.
 *          example: 'password123'
 *        passwordConfirm:
 *          type: string
 *          description: Password conformation.
 *          example: 'password123'
 *    inputLogin:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          description: The user email.
 *          example: 'user@mail.com'
 *        password:
 *          type: string
 *          description: The user password.
 *          example: 'password123'
 *
 */
