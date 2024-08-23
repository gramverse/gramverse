import {AuthorizedUser} from "../models/profile/authorized-user";
import e, {Router, Request, Response, NextFunction} from "express";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { zodLikeRequest, LikeRequest } from '../models/like/like-request';
import { jwtSecret, postService } from "../config";
import { CommentsLikeRequest, zodCommentslikeRequest } from "../models/commentslike/commentslike-request";

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
            res.status(err.statusCode).send(err);
            return;
        }
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
            throw new HttpError(400, ErrorCode.MISSING_LIKEE_POSTID, "Missing likee postId")
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
            throw new HttpError(400, ErrorCode.MISSING_LIKEE_COMMENTID, "Missing likee commentId");
        }
        const commentsLikeRequest: CommentsLikeRequest = zodCommentslikeRequest.parse({...req.body, userName: req.user.userName});
        if (commentsLikeRequest.isLike){
            success = postService.likeComment(commentsLikeRequest);
        }
        if (!commentsLikeRequest.isLike){
            success = postService.unlikeComment(commentsLikeRequest);
        }
        if (!success){
            res.status(500).send();
            console.log(success);
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