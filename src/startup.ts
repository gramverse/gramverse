import express, { ErrorRequestHandler,Request,Response,NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {ZodError} from "zod";
import {HttpError} from "./errors/http-error";
import {userRouter} from "./routes/user.route";
import {tokenRouter} from "./routes/reset.route";
import {fileRouter} from "./routes/file.route";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./swagger";
import swaggerJSDoc from "swagger-jsdoc";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
        res.status(400).send({message: err.errors});
        return;
    } else if (err instanceof HttpError) {
        res.status(err.statusCode).send(err.errorCode);
        return;
    }
    res.status(500).send();
}


const middleware = (req:Request,res:Response,next:NextFunction) => {
    console.log(1)
    next()
}

export const buildApp = () => {
    const app = express();
    
    app.use(cors());
    app.use(cookieParser());
    app.use("api/files", fileRouter);
    app.use(express.json());
    
    // app.use(errorHandler);
    
    app.use("/api/users", middleware,userRouter);
    app.use("/api/reset", tokenRouter);
    app.use("/api/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocs))

    app.use((req, res, next) => {
        res.status(404).send({messge: "Not found"});
    });

    return app;
}