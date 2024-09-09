import jwt, {JwtPayload}  from "jsonwebtoken";
import {AuthorizedUser} from "../models/profile/authorized-user";
import {Router, Request, Response, NextFunction} from "express";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { jwtSecret, postService } from "../config";
import { zodLikeRequest, LikeRequest } from '../models/like/like-request';
import { CommentsLikeRequest, zodCommentslikeRequest } from "../models/commentslike/commentslike-request";
import {zodCommentRequest } from "../models/comment/comment-request";
import { BookmarkRequest, zodBookmarkRequest } from "../models/bookmark/bookmark-request";
import { authMiddleware } from "../middlewares/auth-middleware";
import {zodGetCommentsRequest} from "../models/comment/get-comments-request";
import {zodGetPostsRequest} from "../models/post/get-posts-request";
import {zodMyBookMarkRequest} from "../models/bookmark/mybookmark-request"
declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const postRouter = Router();

postRouter.use(authMiddleware);

postRouter.post("/like", async (req: Request, res, next) => {
    try{
        let success;
        
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const likeePostId = req.body.postId;
        if (!likeePostId){
            throw new HttpError(400, ErrorCode.MISSING_LIKE_POSTID, "Missing likee postId")
        }
        const likeRequest : LikeRequest = zodLikeRequest.parse({...req.body, userName: req.user.userName})
        if (likeRequest.isLike){
            success = await postService.likePost(likeRequest);
        }
        if (!likeRequest.isLike){
            success = await postService.unlikePost(likeRequest);
        }
        if (!success){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        res.status(200).send();
    } catch(err){
        next(err);
    }
})

postRouter.post("/likeComment", async (req: Request, res, next) =>{
    try{
        let success;
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const likeeCommentId = req.body.commentId;
        if (!likeeCommentId){
            throw new HttpError(400, ErrorCode.MISSING_LIKE_COMMENTID, "Missing likee commentId");
        }
        const commentsLikeRequest: CommentsLikeRequest = zodCommentslikeRequest.parse({...req.body, userName: req.user.userName});
        if (commentsLikeRequest.isLike){
            success = await postService.likeComment(commentsLikeRequest);
        }
        if (!commentsLikeRequest.isLike){
            success = await postService.unlikeComment(commentsLikeRequest);
        }
        if (!success){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        res.status(200).send();
    } catch(err){
        next(err);
    }


})

postRouter.post("/bookmark", async (req: Request, res, next) =>{
    try{
        let success;
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const bookmarkPostId = req.body.postId;
        if (!bookmarkPostId){
            throw new HttpError(400, ErrorCode.MISSING_BOOKMARK_POSTID, "Missing bookmark postId");
        }
        const bookmarkRequest: BookmarkRequest = zodBookmarkRequest.parse({...req.body, userName: req.user.userName});
        if (bookmarkRequest.isBookmark){
            success = await postService.bookmark(bookmarkRequest)
        }
        if (!bookmarkRequest.isBookmark){
            success = await postService.unbookmark(bookmarkRequest)
        }
        if (!success){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        res.status(200).send();
    } catch(err){
        next(err);
    }
})


postRouter.get("/post/:postId", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const postDetailDto = await postService.getPostById(req.params.postId, req.user.userName);
        if (!postDetailDto) {
            throw new HttpError(404, ErrorCode.POST_NOT_FOUND, "Post not found");
        }
        res.status(200).send(postDetailDto);
    } catch (err) {
        next(err);
    }
})

postRouter.get("/explorePosts", async (req : Request, res, next) => {
    try{
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const userName = req.user.userName;
        const {page, limit} = zodGetPostsRequest.parse(req.query);
        const postDtos = await postService.getExplorePosts(userName, page, limit);
        res.send(postDtos);
    } catch(err){
        next(err);
    }
});

postRouter.get("/myPosts", async (req : Request, res, next) => {
    try{
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const userName = req.user.userName;
        const {page, limit} = zodGetPostsRequest.parse(req.query);
        const postDtos = await postService.getPosts(userName, userName, page, limit);
        res.send(postDtos);
    } catch(err){
        next(err);
    }
});


postRouter.get("/userName/:userName", async (req : Request, res, next) => {
    try{
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const userName = req.params.userName;
        const {page, limit} = zodGetPostsRequest.parse(req.query);
        const postDtos = await postService.getPosts(userName, req.user.userName, page, limit);
        res.send(postDtos);
    } catch(err){
        next(err);
    }
});

postRouter.post("/addComment", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const commentRequest = zodCommentRequest.parse({...req.body, userName: req.user.userName});
        const createdComment = await postService.addComment(commentRequest);
        if (!createdComment) {
            res.status(500).send();
            return;
        }
        res.status(200).send(createdComment);
    } catch (err) {
        next(err);
    }
})

postRouter.get("/comments", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const {postId, page, limit} = zodGetCommentsRequest.parse(req.query);
        const comments = await postService.getComments(req.user.userName, postId, page, limit);
        res.status(200).send(comments);
    } catch (err) {
        next(err);
    }
})

postRouter.get("/myBookMarks",async(req:Request,res,next) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const {page, limit} = zodMyBookMarkRequest.parse(req.query);
        const posts = await postService.getMyBookMarks(req.user.userName, page, limit);
        res.status(200).send(posts);
    } catch (err) {
        next(err);
    }   
})
