import dotenv from "dotenv";
import mongoose from "mongoose";
import { buildApp } from "./startup";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

export const app = buildApp();
const port = process.env.port || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation',
    },
  },
  apis: ['./routes/*.ts'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const connectionString = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error("Connection string is not set.");
}

mongoose.connect(connectionString)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
            console.log(`Swagger UI available at http://5.34.193.118:${port}/api-docs`);
        });
    })
    .catch(err => {
        console.error(`Error connecting to MongoDB: ${err}`);
    });