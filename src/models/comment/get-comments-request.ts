import { z } from "zod";

export const zodGetCommentsRequest = z.object({
    postId: z.string(),
    page: z.number(),
    limit: z.number(),
});