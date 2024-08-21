export interface IComment extends Document {
    _id: string;
    userName: string;
    postId: string;
    comment: string;
    parentCommentId: string;
    creationDate: Date;
    isDeleted: boolean;
}

export interface Comment {
    _id: string;
    userName: string;
    postId: string;
    comment: string;
    parentCommentId: string;
    creationDate: Date;
    isDeleted: boolean;
}