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

