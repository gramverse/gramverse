/**
 * @swagger
 * /api/files/addPost:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - files
 *     requestBody:
 *       description: Post information
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photoFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               postFields:
 *                 type: string
 *                 description: object
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/files/editPost:
 *   post:
 *     summary: Edit a post with provided post id
 *     tags:
 *       - files
 *     requestBody:
 *       description: Post information
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photoFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               postFields:
 *                 type: string
 *                 description: object
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/files/profile:
 *   post:
 *     summary: Edit the profile of the currently logged-in user.
 *     tags:
 *       - files
 *     requestBody:
 *       description: Profile information to update.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               profileFields:
 *                 type: string
 *                 description: {userName: string, email: string, password: string, firstName: string, lastName: string, isPrivate: boolean, profileImage: string, bio: string}
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */
