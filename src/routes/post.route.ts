import jwt, {JwtPayload} from "jsonwebtoken";
import {AuthorizedUser} from "../models/profile/authorized-user";
import {Router, Request, Response, NextFunction} from "express";
import {
    AuthorizationError,
    HttpError,
    MissingFieldError,
    NotFoundError,
    UnknownError,
} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {commentService, jwtSecret, postService} from "../config";
import {zodLikeRequest, LikeRequest} from "../models/like/like-request";
import {
    CommentsLikeRequest,
    zodCommentslikeRequest,
} from "../models/commentslike/commentslike-request";
import {zodCommentRequest} from "../models/comment/comment-request";
import {
    BookmarkRequest,
    zodBookmarkRequest,
} from "../models/bookmark/bookmark-request";
import {authMiddleware} from "../middlewares/auth-middleware";
import {zodGetCommentsRequest} from "../models/comment/get-comments-request";
import {zodGetPostsRequest} from "../models/post/get-posts-request";
import {zodMyBookMarkRequest} from "../models/bookmark/mybookmark-request";
declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const postRouter = Router();

postRouter.use(authMiddleware);

postRouter.post("/like", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const likeePostId = req.body.postId;
        if (!likeePostId) {
            throw new MissingFieldError("postId");
        }
        const likeRequest: LikeRequest = zodLikeRequest.parse({
            ...req.body,
            userName: req.user.userName,
        });
        if (likeRequest.isLike) {
            await postService.likePost(likeRequest);
        }
        if (!likeRequest.isLike) {
            await postService.unlikePost(likeRequest);
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

postRouter.post("/likeComment", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const likeeCommentId = req.body.commentId;
        if (!likeeCommentId) {
            throw new MissingFieldError("commentId");
        }
        const commentsLikeRequest: CommentsLikeRequest =
            zodCommentslikeRequest.parse({
                ...req.body,
                userName: req.user.userName,
            });
        if (commentsLikeRequest.isLike) {
            await commentService.likeComment(commentsLikeRequest);
        }
        if (!commentsLikeRequest.isLike) {
            await commentService.unlikeComment(commentsLikeRequest);
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

postRouter.post("/bookmark", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const bookmarkPostId = req.body.postId;
        if (!bookmarkPostId) {
            throw new MissingFieldError("postId");
        }
        const bookmarkRequest: BookmarkRequest = zodBookmarkRequest.parse({
            ...req.body,
            userName: req.user.userName,
        });
        if (bookmarkRequest.isBookmark) {
            await postService.bookmark(bookmarkRequest);
        }
        if (!bookmarkRequest.isBookmark) {
            await postService.unbookmark(bookmarkRequest);
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

postRouter.get("/post/:postId", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const postDetailDto = await postService.getPostById(
            req.params.postId,
            req.user.userName,
        );
        res.status(200).send(postDetailDto);
    } catch (err) {
        next(err);
    }
});

postRouter.get("/explorePosts", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const userName = req.user.userName;
        const {page, limit} = zodGetPostsRequest.parse(req.query);
        const postDtos = await postService.getExplorePosts(
            userName,
            page,
            limit,
        );
        res.send(postDtos);
    } catch (err) {
        next(err);
    }
});

postRouter.get("/myPosts", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const userName = req.user.userName;
        const {page, limit} = zodGetPostsRequest.parse(req.query);
        const postDtos = await postService.getPosts(
            userName,
            userName,
            page,
            limit,
        );
        res.send(postDtos);
    } catch (err) {
        next(err);
    }
});

postRouter.get("/userName/:userName", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const userName = req.params.userName;
        const {page, limit} = zodGetPostsRequest.parse(req.query);
        const postDtos = await postService.getPosts(
            userName,
            req.user.userName,
            page,
            limit,
        );
        res.send(postDtos);
    } catch (err) {
        next(err);
    }
});

postRouter.post("/addComment", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const commentRequest = zodCommentRequest.parse({
            ...req.body,
            userName: req.user.userName,
        });
        await commentService.addComment(commentRequest);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

postRouter.get("/comments", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {postId, page, limit} = zodGetCommentsRequest.parse(req.query);
        const comments = await commentService.getComments(
            req.user.userName,
            postId,
            page,
            limit,
        );
        res.status(200).send(comments);
    } catch (err) {
        next(err);
    }
});

postRouter.get("/myBookMarks", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {page, limit} = zodMyBookMarkRequest.parse(req.query);
        const posts = await postService.getMyBookMarks(
            req.user.userName,
            page,
            limit,
        );
        res.status(200).send(posts);
    } catch (err) {
        next(err);
    }
});

postRouter.post("/updateAll", async (req, res, next) => {
    const result = await postService.updateAllPosts();
    res.status(200).send(result);
})