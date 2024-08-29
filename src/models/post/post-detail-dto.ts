import {CommentDto} from "../comment/comment-dto";

export type PostDetailDto = {
    _id : String,
    userName : String,
    photoUrls: String[],
    caption : String,
    mentions: String[],
    forCloseFriends: boolean,
    tags : String[]
    creationDate: Date,
    commentsCount: number,
    likesCount: number,
    bookmarksCount: number,
    isLiked: boolean,
    isBookmarked: boolean,
}