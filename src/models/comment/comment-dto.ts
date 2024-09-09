import {Comment} from "./comment";

export type CommentDto = {
    _id: string;
    userName: string;
    postId: string;
    comment: string;
    parentCommentId: string;
    parentCommentUserName: string;
    creationDate: Date;
    likesCount: number;
    isLiked: boolean;
    childDtos: CommentDto[];
};
