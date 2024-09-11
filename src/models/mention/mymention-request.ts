import {z} from "zod";

export const zodMyMentionRequest = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
});

export type MyMentionRequest = z.infer<typeof zodMyMentionRequest>;
