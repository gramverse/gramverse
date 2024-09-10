/**
 * @swagger
 * /api/reset/request-reset-password:
 *   post:
 *     summary: Request a password reset token
 *     tags:
 *       - reset
 *     description: Sends a password reset token to the user's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset token generated and sent to the email.
 *       400:
 *         description: Invalid email address provided.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/reset/validate-reset-token:
 *   post:
 *     summary: Validate a password reset token
 *     tags:
 *       - reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/reset/reset-password:
 *   post:
 *     summary: Reset the password using a valid token
 *     tags:
 *       - reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
