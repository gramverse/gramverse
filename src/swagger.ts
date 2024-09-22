import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

let swaggerPath: string;
if (process.env.NODE_ENV == "Dev") {
    swaggerPath = "./src/swagger/*.ts";
} else {
    swaggerPath = "./src/swagger/*.js";
}

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "collegeGram",
            version: "1.0.0",
            description: "API documentation",
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    apis: [swaggerPath],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export {swaggerUi, swaggerDocs};
