/**
 * @swagger
 * /api/users/profile/{userName}:
 *   get:
 *     summary: Get user profile by username.
 *     tags:
 *       - profile
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
 *       - profile
 *     responses:
 *       200:
 *         description: User's own profile retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

