/**
 * @swagger
 * /api/users/closeFriend:
 *   post:
 *     summary: Add/remove a user in close friends
 *     tags:
 *       - close friends
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
 *       - close friends
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

