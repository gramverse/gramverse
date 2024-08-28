import z from "zod";

export const zodCommentslikeRequest = z.object({
    commentId: z.string(),
    userName: z.string(),
    isLike: z.boolean(),
})

export type CommentsLikeRequest = z.infer<typeof zodCommentslikeRequest>
export type CommentsLikeDto = {
    userName: string,
    commentId: string,
    isDeleted: boolean,
}