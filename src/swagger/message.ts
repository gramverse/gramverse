/**
 * @swagger
 * /api/messages/messages:
 *   get:
 *     summary: Get messages between two users
 *     tags:
 *       - messages
 *     parameters:
 *       - in: query
 *         name: chatId
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
 *         description: Messages retrieved successfully.
 *       400:
 *         description: Bad request, invalid input.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/messages/chatDetail:
 *   get:
 *     summary: Get chat details.
 *     tags:
 *       - messages
 *     parameters:
 *       - in: query
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: chat details.
 *       400:
 *         description: Bad request, invalid input.
 *       500:
 *         description: Internal server error.
 */

