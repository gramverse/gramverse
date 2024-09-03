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
 *     summary: Follow/unfollow a user
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
 *               isFollow:
 *                 type: boolean
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
 * /api/users/followingers:
 *   get:
 *     summary: Get list of followers/followings of requested user
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

/**
 * @swagger
 * /api/users/closeFriend:
 *   post:
 *     summary: Add/remove a user in close friends
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               isAdd:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User successfully Added to close friends
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/closeFriends:
 *   get:
 *     summary: get List of logged in user close friends
 *     tags:
 *       - users
 *     parameters:
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


/**
 * @swagger
 * /api/users/acceptRequest:
 *   post:
 *     summary: Accept/decline a follow request
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerUserName:
 *                 type: string
 *               accepted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Request successfully accepted/declined
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/block:
 *   post:
 *     summary: Block/UnBlock a user
 *     tags:
 *       - block
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingUserName:
 *                 type: string
 *               isBlock:
 *                 type: boolean
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
 * /api/users/blackList:
 *   get:
 *     summary: Get Black list
 *     tags:
 *       - block
 *     parameters:
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
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
 *         description: List retrieved successfully.
 *       401:
 *         description: Not authorized.
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
 *       - users
 *     responses:
 *       200:
 *         description: Successfully signed out.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 */

/**
 * @swagger
 * /api/users/removeFollow:
 *   post: 
 *     summary: remove a user from followers
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content: 
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerUserName:
 *                 type: string
 *     responses:
 *        200:
 *           description: User removed from followers successfully
 *        401:
 *           description: Unauthorized, token is missing or invalid
 *        400:
 *           description: Missing follower username
 *        500: 
 *           description: internal server error
 */ 