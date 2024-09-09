export interface ILike extends Like, Document {}

export interface Like {
    _id: string;
    userName: string;
    postId: string;
    isDeleted: boolean;
    creationDate: Date;
}
