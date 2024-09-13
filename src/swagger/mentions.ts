/**
 * @swagger
 * /api/posts/myMentions:
 *   get:
 *     summary: Retrieve mentioned posts (tagges) for the current user
 *     description: This route allows the current authenticated user to retrieve a list of posts they are tagged in.
 *     tags:
 *       - Mentions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully returned the list of mentioned posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized access (user is not logged in)
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
