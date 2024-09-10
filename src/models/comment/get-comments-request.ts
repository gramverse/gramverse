import {z} from "zod";

export const zodGetCommentsRequest = z.object({
    postId: z.string(),
    page: z.coerce.number(),
    limit: z.coerce.number(),
});

export type GetCommentsRequest = z.infer<typeof zodGetCommentsRequest>;
