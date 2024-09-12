import {authMiddleware} from "../middlewares/auth-middleware";
import {Router, Request, Response, NextFunction} from "express";
import {AuthorizationError, HttpError} from "../errors/http-error";
import { zodSearchRequest } from "../models/search/search-request";
import { searchService } from "../config";

export const searchRouter = Router();
searchRouter.use(authMiddleware);

searchRouter.get("/tag", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {tag,page, limit} = zodSearchRequest.parse(req.query);
        const notifications = await searchService.searchTags(tag,limit,page)
        res.status(200).send(notifications);
    } catch (err) {
        next(err);
    }
});

searchRouter.get("/Suggesttag", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {tag,page, limit} = zodSearchRequest.parse(req.query);
        const notifications = await searchService.SuggestTags(tag,limit,page)
        res.status(200).send(notifications);
    } catch (err) {
        next(err);
    }
});
