/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     summary: Follow/unfollow a user
 *     tags:
 *       - follow
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
 *       - follow
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
 * /api/users/acceptRequest:
 *   post:
 *     summary: Accept/decline a follow request
 *     tags:
 *       - follow
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
 * /api/users/removeFollow:
 *   post:
 *     summary: remove a user from followers
 *     tags:
 *       - follow
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

