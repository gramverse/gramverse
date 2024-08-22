
export type Comment = {
    _id: string,
    userName: string,
    postId: string,
    comment: string,
    parentCommentId: string,
    creationDate: Date,
    isDeleted: boolean,
}