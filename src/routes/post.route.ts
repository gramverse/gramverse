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

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const postRouter = Router();

postRouter.use((req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["bearer"];
        if (!token) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const authorizedUser = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = authorizedUser["data"] as AuthorizedUser;
        next();
    } catch (err) {
        if (err instanceof HttpError) {
            console.error("Not authorized");
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
});

postRouter.post("/like", async (req: Request, res) => {
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
            res.status(500).send();
            console.log(success);
            return;
        }
        res.status(200).send();
        
    } catch(err){
        if (err instanceof HttpError){
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
})

postRouter.post("/likeComment", async (req: Request, res) =>{
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
            res.status(500).send();
            console.log(success);
            return;
        }
        res.status(200).send();

    } catch(err){
        if (err instanceof HttpError){
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }


})
postRouter.post("/bookmark", async (req: Request, res) =>{
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
            res.status(500).send();
            console.log(success);
            return;
        }
        res.status(200).send();
    } catch(err){
        if (err instanceof HttpError){
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
}
)


postRouter.get("/post/:postId", async (req: Request, res) => {
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
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
})

postRouter.get("/myPosts", async (req : Request, res) => {
    try{
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const userName = req.user.userName;
        const postDtos = await postService.getPosts(userName);
        res.send(postDtos);
    } catch(err){
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
});


postRouter.get("/userName/:userName", async (req : Request, res) => {
    try{
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const userName = req.params.userName;
        const postDtos = await postService.getPosts(userName);
        res.send(postDtos);
    } catch(err){
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
});

postRouter.post("/addComment", async (req: Request, res) => {
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
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
})
