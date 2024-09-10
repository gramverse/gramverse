import {CommentRepService} from "./comment.rep.service";
import {CommentLikeRepository} from "../repository/commentlike.repository";
import {CommentDto} from "../models/comment/comment-dto";
import {Comment} from "../models/comment/comment";
import {PostRepService} from "./post.rep.service";
import {
    CommentsLikeDto,
    CommentsLikeRequest,
} from "../models/commentslike/commentslike-request";
import {CommentRequest} from "../models/comment/comment-request";
import {
    NotFoundError,
    UnknownError,
    ValidationError,
} from "../errors/http-error";
import {NotificationService} from "./notification.service";

export class CommentService {
    constructor(
        private commentRepService: CommentRepService,
        private postRepService: PostRepService,
        private notificationService: NotificationService,
    ) {}

    addComment = async (commentRequest: CommentRequest) => {
        if (
            commentRequest.parentCommentId != "" &&
            !(await this.commentRepService.getById(
                commentRequest.parentCommentId,
            ))
        ) {
            throw new ValidationError("parentCommentId");
        }
        await this.postRepService.checkPostAccess(
            commentRequest.userName,
            commentRequest.postId,
        );
        const createdComment =
            await this.commentRepService.createComment(commentRequest);
        if (createdComment) {
            this.notificationService.addComment(
                commentRequest.userName,
                createdComment,
            );
        }
        return createdComment || undefined;
    };
    getComments = async (
        userName: string,
        postId: string,
        page: number,
        limit: number,
    ) => {
        await this.postRepService.checkPostAccess(userName, postId);
        const parentComments = await this.commentRepService.getCommentsByPostId(
            postId,
            page,
            limit,
        );
        const allDtos: CommentDto[] = [];
        for (const c of parentComments) {
            const dto: CommentDto = await this.getCommentDto(userName, "", c);
            allDtos.push(dto);
        }
        const commentsCount =
            await this.commentRepService.getRootCountByPostId(postId);
        return {comments: allDtos, totalCount: commentsCount};
    };

    getCommentDto = async (
        requestUserName: string,
        parentCommentUserName: string,
        comment: Comment,
    ) => {
        const {
            _id,
            userName,
            postId,
            comment: commentText,
            parentCommentId,
            creationDate,
        } = comment;
        const commentDto: CommentDto = {
            _id,
            userName,
            postId,
            comment: commentText,
            parentCommentId,
            parentCommentUserName,
            creationDate,
            isLiked: await this.commentRepService.commentLikeExists(
                requestUserName,
                comment._id,
            ),
            likesCount: await this.commentRepService.getLikeCountByCommentId(
                comment._id,
            ),
            childDtos: [],
        };
        for (const c of comment.childComments) {
            commentDto.childDtos.push(
                await this.getCommentDto(requestUserName, comment.userName, c),
            );
        }
        return commentDto;
    };

    likeComment = async (commentslikeRequest: CommentsLikeRequest) => {
        const comment = await this.commentRepService.getById(
            commentslikeRequest.commentId,
        );
        if (!comment) {
            throw new NotFoundError("comment");
        }
        await this.postRepService.checkPostAccess(
            commentslikeRequest.userName,
            comment.postId,
        );
        const existingCommentsLike =
            await this.commentRepService.getCommentLike(
                commentslikeRequest.userName,
                commentslikeRequest.commentId,
            );
        if (existingCommentsLike) {
            if (!existingCommentsLike.isDeleted) {
                return;
            }

            await this.commentRepService.undeleteCommentLike(
                commentslikeRequest.userName,
                commentslikeRequest.commentId,
            );
            return;
        }
        const commentsLikeDto: CommentsLikeDto = {
            userName: commentslikeRequest.userName,
            commentId: commentslikeRequest.commentId,
            isDeleted: false,
        };
        await this.commentRepService.createLike(commentsLikeDto);
    };

    unlikeComment = async (commentslikeRequest: CommentsLikeRequest) => {
        const comment = await this.commentRepService.getById(
            commentslikeRequest.commentId,
        );
        if (!comment) {
            throw new NotFoundError("comment");
        }
        await this.postRepService.checkPostAccess(
            commentslikeRequest.userName,
            comment.postId,
        );
        const existingCommentsLike =
            await this.commentRepService.getCommentLike(
                commentslikeRequest.userName,
                commentslikeRequest.commentId,
            );
        if (!existingCommentsLike || existingCommentsLike.isDeleted) {
            return;
        }

        await this.commentRepService.deleteCommentLike(
            commentslikeRequest.userName,
            commentslikeRequest.commentId,
        );
    };
}
