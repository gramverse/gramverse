import {CommentDto} from "../comment/comment-dto";

export type PostDetailDto = {
    _id: string,
    userName: string,
    photoUrls: string[],
    caption : String,
    mentions: String[],
    forCloseFriends: boolean,
    tags: string[],
    creationDate: Date,
    commentsCount: number,
    likesCount: number,
    bookmarksCount: number,
    isLiked: boolean,
    isBookmarked: boolean,
}