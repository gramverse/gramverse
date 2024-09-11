import z from "zod";

export interface IPost extends Post, Document {}

export interface Post {
    _id: string;
    userName: string;
    photoUrls: string[];
    caption: string;
    mentions: string[];
    forCloseFriends: boolean;
    likesCount: number;
    creationDate: Date;
}

export const zodPostDto = z.object({
    userName: z.string().nonempty(),
    photoUrls: z.array(z.string()).nonempty(),
    caption: z.string(),
    mention: z.string().nonempty(),
    forCloseFriends: z.boolean(),
});

export type PostDto = z.infer<typeof zodPostDto>;
