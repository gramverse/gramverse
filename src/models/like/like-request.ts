import z from "zod";

export const zodLikeRequest = z.object({
    postId: z.string(),
    userName: z.string(),
    isLike: z.boolean()
})

export type LikeRequest = z.infer<typeof zodLikeRequest>