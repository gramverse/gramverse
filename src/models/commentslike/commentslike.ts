export interface ICommentslike extends Document {
    _id: string;
    userName: string;
    commentId: string;
    isDeleted: boolean;
    creationDate: Date;
}

export interface Commentslike {
    _id: string;
    userName: string;
    commentId: string;
    isDeleted: boolean;
    creationDate: Date;
}
