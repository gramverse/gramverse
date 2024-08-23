
export type CommentDto = {
    _id: string,
    userName: string,
    postId: string,
    comment: string,
    parentCommentId: string,
    creationDate: Date,
    isDeleted: boolean,
    likesCount: number,
    isLiked: boolean,
    childComments: CommentDto[],
}