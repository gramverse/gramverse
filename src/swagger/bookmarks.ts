/**
 * @swagger
 * /api/posts/myBookMarks:
 *   get:
 *     summary: Retrieve saved posts (bookmarks) for the current user
 *     description: This route allows the current authenticated user to retrieve a list of posts they have saved as bookmarks.
 *     tags:
 *       - Bookmarks
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
