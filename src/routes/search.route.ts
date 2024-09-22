import {authMiddleware} from "../middlewares/auth-middleware";
import {Router, Request, Response, NextFunction} from "express";
import {AuthorizationError, HttpError} from "../errors/http-error";
import {zodSearchRequest} from "../models/search/search-request";
import {searchService, userRepService} from "../config";
import {zodSearchAccountRequest} from "../models/search/search-account-request";

export const searchRouter = Router();
searchRouter.use(authMiddleware);

searchRouter.get("/tag", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {tag, page, limit} = zodSearchRequest.parse(req.query);
        const userName = req.user.userName;
        console.log(userName,"USERNAME")
        const notifications = await searchService.searchTags(tag, limit, page,userName);
        console.log(notifications,"notif")
        res.status(200).send(notifications);
    } catch (err) {
        next(err);
    }
});
searchRouter.get("/specTag", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {tag, page, limit} = zodSearchRequest.parse(req.query);
        const notifications = await searchService.searchSpecTags(
            tag,
            limit,
            page,
        );
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
        const {tag, page, limit} = zodSearchRequest.parse(req.query);
        const notifications = await searchService.SuggestTags(tag, limit, page);
        res.status(200).send(notifications);
    } catch (err) {
        next(err);
    }
});

searchRouter.get("/accounts", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const myUserName = req.user.userName;
        const {userName, page, limit} = zodSearchAccountRequest.parse(
            req.query,
        );
        const notifications = await userRepService.searchAccounts(
            myUserName,
            userName,
            limit,
            page, 
        );
        res.status(200).send(notifications);
    } catch (err) {
        next(err);
    }
});
