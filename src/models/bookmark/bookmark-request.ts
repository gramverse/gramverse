import z from "zod";

export const zodBookmarkRequest = z.object({
    userName: z.string(),
    postId: z.string(),
    isBookmark: z.boolean(),
});

export type BookmarkRequest = z.infer<typeof zodBookmarkRequest>;
export type BookmarkDto = {
    userName: string;
    postId: string;
    isDeleted: boolean;
};
