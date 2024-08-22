import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import path from "path";
import {jwtSecret, userService} from "../config"
import{Router, ErrorRequestHandler, Request, Response, NextFunction} from "express";
import multer from "multer";
import {HttpError} from "../errors/http-error";
import {AuthorizedUser} from "../models/profile/authorized-user";
import {ErrorCode} from "../errors/error-codes";
import { zodProfileDto } from "../models/profile/edit-profile-dto";
import { zodPostRequest } from "../models/post/post-request";
import { string } from "zod";
import { postService } from "../config";
import { zodEditPostRequest } from "../models/post/edit-post-request";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const fileRouter = Router();

const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits:  {
        fileSize: 1024*1024*4,
    }
});

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

fileRouter.post("/addPost", upload.array("photoFiles", 10), async (req : Request, res) => {
    try{
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const files = req.files as Express.Multer.File[]
        const photoUrls: string[] = [];
        if (!req.files){
            res.status(500).send();
            return;
        } 
        files.forEach( f => {
            photoUrls.push(`/api/files/${f.filename}`)
        })
        
        const fields = JSON.parse(req.body["postFields"]);
        const postRequest = zodPostRequest.parse({...fields, photoUrls, userName : req.user.userName})
        const newPost = await postService.addPost(postRequest);
        
        if (!newPost) {
            res.status(500).send()
        }
        res.status(200).send(newPost);
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

fileRouter.post("/editPost", upload.array("photoFiles", 10), async (req : Request, res) => {
    try{
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const files = req.files as Express.Multer.File[]
        
        const fields = JSON.parse(req.body["postFields"]);
        const postRequest = zodEditPostRequest.parse({...fields, userName : req.user.userName});
        if (req.files){
            files.forEach( f => {
                postRequest.photoUrls.push(`/api/files/${f.filename}`);
            })
        } 
        const edittedPost = await postService.editPost(postRequest);
        
        if (!edittedPost) {
            res.status(500).send()
        }
        res.status(200).send(edittedPost);
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
        const filePath = path.join(__dirname, "..", "..", "uploads", req.params.fileName);

        res.status(200).download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

fileRouter.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).send(new HttpError(400, ErrorCode.FILE_TOO_LARGE, "Max file size = 4 MB"));
            return;
        } else {
            res.status(400).send(new HttpError(400, ErrorCode.FILE_UPLOAD_ERROR, "an error occurred uploading file"));
            return;
        }
    }
});

fileRouter.use((req, res, next) => {
    res.status(404).send({message: "Not found"});
})