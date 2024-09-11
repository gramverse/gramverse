import z from "zod";

export const zodMentionRequest = z.object({
    userName: z.string(),
    postId: z.string(),
    isMention: z.boolean(),
});

export type MentionRequest = z.infer<typeof zodMentionRequest>;
export type MentionDto = {
    userName: string;
    postId: string;
    isDeleted: boolean;
};
