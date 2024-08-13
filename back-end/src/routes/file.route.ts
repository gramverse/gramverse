import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import {jwtSecret, userService} from "../config"
import{Router, Request, Response, NextFunction} from "express";
import multer from "multer";
import {HttpError} from "../errors/http-error";
import {AuthorizedUser} from "../models/authorized-user";
import {ErrorCode} from "../errors/error-codes";
import { zodProfileDto } from "../models/profile-dto";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const fileRouter = Router();

const upload = multer({dest: "uploads/"});

fileRouter.use((req: Request, res: Response, next: NextFunction) => {
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

fileRouter.post("/myProfile", upload.single("profileImage"), async (req: Request, res) => {
    try {
        let imageUrl: string;
        if (!req.file) {
            imageUrl = "";
        } else {
            imageUrl = `/files/${req.file.filename}`;
        }
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const fields = JSON.parse(req.body["profileFields"]);
        const profileDto = zodProfileDto.parse({...fields, profileImage: imageUrl, userName: req.user.userName});
        const updatedProfile = await userService.editProfile(profileDto, req.user);
        res.status(200).send(updatedProfile);
    } catch (err) {
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
});

fileRouter.use((req, res, next) => {
    res.status(404).send({message: "Not found"});
})