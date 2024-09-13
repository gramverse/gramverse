/**
 * @swagger
 * /api/posts/post/{postId}:
 *   get:
 *     summary: Get requested post
 *     tags:
 *       - posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The requested post id
 *     responses:
 *       200:
 *         description: Retrieved post
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/posts/myPosts:
 *   get:
 *     summary: Get created posts by the currently logged-in user.
 *     tags:
 *       - posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number (starting from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of results in each page
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
 * /api/posts/userName/{userName}:
 *   get:
 *     summary: Get posts for the requested username
 *     tags:
 *       - posts
 *     parameters:
 *       - in: path
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user to retrieve posts.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number (starting from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of results in each page
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
 * /api/posts/explorePosts:
 *   get:
 *     summary: Get explore posts for the currently logged-in user.
 *     tags:
 *       - posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number (starting from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of results in each page
 *     responses:
 *       200:
 *         description: Posts retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */
