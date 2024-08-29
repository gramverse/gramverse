import { z } from "zod";

export const zodGetPostsRequest = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
})