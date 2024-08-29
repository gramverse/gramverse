/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - users
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
 *       - users
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
 * /api/users/profile/{userName}:
 *   get:
 *     summary: Get user profile by username.
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user to retrieve.
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
 * /api/users/myProfile:
 *   get:
 *     summary: Get the profile of the currently logged-in user.
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: User's own profile retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingUserName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully followed
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/unfollow:
 *   post:
 *     summary: Unfollow a user.
 *     tags:
 *       - users
 *     requestBody:
 *       description: Unfollow request data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingUserName:
 *                 type: string
 *                 description: The username of the user to unfollow.
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user.
 *       400:
 *         description: Missing following username.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/followingers:
 *   get:
 *     summary: Get comments for the requested post
 *     tags:
 *       - users
 *     parameters:
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: isFollowing
 *         schema:
 *           type: boolean
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           format: int32
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: Posts retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */