import z from 'zod'

export interface IPost extends Document {
    _id: string;
    userName: string;
    photoUrls: string[];
    caption: string;
    mentions: string[];
    creationDate: Date,
}

export interface Post {
    _id: string;
    userName: string;
    photoUrls: string[];
    caption: string;
    mentions: string[];
    creationDate: Date,
}

export const zodPostDto = z.object({
    userName : z.string().nonempty(),
    photoUrls: z.array(z.string()).nonempty(),
    caption : z.string(),
    mention: z.string().nonempty()
});

export type PostDto = z.infer<typeof zodPostDto>  