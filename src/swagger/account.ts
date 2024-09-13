/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - account
 *     requestBody:
 *       description: User registration information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user.
 *     tags:
 *       - account
 *     requestBody:
 *       description: User login information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User logged in successfully.
 *       401:
 *         description: Invalid username or password.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/signOut:
 *   post:
 *     summary: Sign out the currently authenticated user.
 *     description: This endpoint clears the authentication cookie and signs out the user.
 *     tags:
 *       - account
 *     responses:
 *       200:
 *         description: Successfully signed out.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 */

/**
 * @swagger
 * /api/users/access/{userName}:
 *   get:
 *     summary: get mention access for requested username
 *     tags:
 *       - profile
 *     parameters:
 *       - in: path
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user to check access.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/accounts:
 *   get:
 *     summary: Get list of logged in users for this user
 *     tags:
 *       - account
 *     responses:
 *       200:
 *         description: List of account usernames
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/switchAccount:
 *   post:
 *     summary: Switch to requested username
 *     tags:
 *       - account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account switched successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
