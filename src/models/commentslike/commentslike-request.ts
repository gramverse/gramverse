import z from "zod";

export const zodCommentslikeRequest = z.object({
    userName: z.string(),
    commentId: z.string(),
    isLike: z.boolean(),
})

export type CommentsLikeRequest = z.infer<typeof zodCommentslikeRequest>
export type CommentsLikeDto = {
    userName: string,
    commentId: string,
    isDeleted: boolean,
}