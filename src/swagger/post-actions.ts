/**
 * @swagger
 * /api/posts/like:
 *   post:
 *     summary: like/unlike a post
 *     tags:
 *       - post actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               isLike:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/bookmark:
 *   post:
 *     summary: bookmark/unbookmark a post
 *     tags:
 *       - post actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               isBookmark:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post bookmarked/unbookmarked successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
