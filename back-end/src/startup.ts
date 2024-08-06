import express from "express";

export const buildApp = () => {
    const app = express();

    app.use(express.json());

    app.use((req, res, next) => {
        res.status(404).send({messge: "Not found"});
    });

    return app;
}