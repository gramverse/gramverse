import { ObjectId } from 'mongodb';

export type Post = {
    postId: ObjectId;
    userName: string;
    postImage: string;
    likeCount: number;
};
