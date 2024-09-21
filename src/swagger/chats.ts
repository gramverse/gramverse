/**
 * @swagger
 * /api/chats/chatList:
 *   get:
 *     summary: Get chat list
 *     tags:
 *       - chats
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
 *         description: chats retrieved successfully.
 *       400:
 *         description: Bad request, invalid input.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/chats/getId:
 *   get:
 *     summary: Get chat id
 *     tags:
 *       - chats
 *     parameters:
 *       - in: query
 *         name: friendUserName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: requested chat id
 *       400:
 *         description: Bad request, invalid input.
 *       500:
 *         description: Internal server error.
 */
