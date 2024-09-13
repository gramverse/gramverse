/**
 * @swagger
 * /api/posts/addComment:
 *   post:
 *     summary: Create new comment
 *     tags:
 *       - comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               comment:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment created
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/comments:
 *   get:
 *     summary: Get comments for the requested post
 *     tags:
 *       - comments
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id to retrieve comments.
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
 * /api/posts/likeComment:
 *   post:
 *     summary: like/unlike a comment
 *     tags:
 *       - comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: string
 *               isLike:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Comment liked/unliked successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
