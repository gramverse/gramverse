/**
 * @swagger
 * /api/posts/myPosts:
 *   get:
 *     summary: Get posts for the currently logged-in user.
 *     tags:
 *       - posts
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
 * /api/posts/like:
 *   post:
 *     summary: like/unlike a post
 *     tags:
 *       - posts
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
 * /api/posts/likeComment:
 *   post:
 *     summary: like/unlike a comment
 *     tags:
 *       - posts
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

/**
 * @swagger
 * /api/posts/bookmark:
 *   post:
 *     summary: bookmark/unbookmark a post
 *     tags:
 *       - posts
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
 * /api/posts/addComment:
 *   post:
 *     summary: Create new comment
 *     tags:
 *       - posts
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

<<<<<<< HEAD

/**
 * @swagger
 * /api/posts/comments:
 *   get:
 *     summary: Get comments for the requested post
 *     tags:
 *       - posts
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
=======
>>>>>>> d369a627d12ab639aee15658b082e8dd07b770ab
