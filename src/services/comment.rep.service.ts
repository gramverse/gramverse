import { CommentRequest } from "../models/comment/comment-request";
import { CommentsLikeDto } from "../models/commentslike/commentslike-request";
import { CommentRepository } from "../repository/comment.repository";
import { CommentLikeRepository } from "../repository/commentlike.repository";

export class CommentRepService {
    constructor (private commentRepository: CommentRepository, private commentLikeRepository: CommentLikeRepository) {}

    createComment = async (commentRequest: CommentRequest) => {
        return await this.commentRepository.add(commentRequest);
    }

    createLike = async (commentLikeDto: CommentsLikeDto) => {
        return await this.commentLikeRepository.add(commentLikeDto);
    }

    getCountByPostId = async (postId: string) => {
        return await this.commentRepository.getCountByPostId(postId);
    }

    commentLikeExists = async (userName: string, commentId: string) => {
        return await this.commentLikeRepository.commentslikeExists(userName, commentId);
    }

    getLikeCountByCommentId = async (commentId: string) => {
        return await this.commentLikeRepository.getCountByCommentId(commentId);
    }

    getById = async (commentId: string) => {
        return await this.commentRepository.getById(commentId);
    }

    getCommentsByPostId = async (postId: string, page: number, limit: number) => {
        const skip = (page-1) * limit;
        return await this.commentRepository.getByPostId(postId, skip, limit)
    }

    getRootCountByPostId = async (postId: string) => {
        return await this.commentRepository.getRootCountByPostId(postId);
    }

    getCommentLike = async (userName: string, commentId: string) => {
        return await this.commentLikeRepository.getCommentLike(userName, commentId);
    }

    undeleteCommentLike = async (userName: string, commentId: string) => {
        return await this.commentLikeRepository.undeleteCommentLike(userName, commentId);
    }

    deleteCommentLike = async (userName: string, commentId: string) => {
        return await this.commentLikeRepository.deleteCommentLike(userName, commentId);
    }
}