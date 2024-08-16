import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import path from "path";
import {jwtSecret, userService} from "../config"
import{Router, Request, Response, NextFunction} from "express";
import multer from "multer";
import {HttpError} from "../errors/http-error";
import {AuthorizedUser} from "../models/authorized-user";
import {ErrorCode} from "../errors/error-codes";
import { zodProfileDto } from "../models/edit-profile-dto";
import { zodPostRequest } from "../models/post-request";
import { string } from "zod";
import { postService } from "../config";

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

fileRouter.post("/addPost", upload.array("postImages"), async (req : Request, res) => {
    try{
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const files = req.files as Express.Multer.File[]
        
        const photos : string[] = [];
        if (!req.files){
            res.status(500).send();
            return;
        } 
        files.forEach( f => {
            photos.push(`/files/${f.filename}`)
        })
        const fields = JSON.parse(req.body["postFields"]);
        const postRequest = zodPostRequest.parse({...fields, userName : req.user.userName, photos})
        const newPost = await postService.addPost(postRequest);
        
        if (!newPost) {
            res.status(500).send()
        }
        return newPost;

    } catch(err){
        
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        
        console.log(err);
        res.status(500).send();
        
    }



})





fileRouter.get("/:fileName", (req, res) => {
    try {
        const filePath = path.join(__dirname, "uploads", req.params.fileName);

        res.status(200).download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

fileRouter.use((req, res, next) => {
    res.status(404).send({message: "Not found"});
})