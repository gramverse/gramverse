export type PostDetailDto = {
    _id : String,
    userName : String,
    photoUrls: String[],
    caption : String,
    mentions: String[],
    tags : String[]
    creationDate: Date,
    comments: CommentDto[],
    commentsCount: number,
    likesCount: number,
    bookmarksCount: number,
    isLiked: boolean,
    isBookmarked: boolean,
}