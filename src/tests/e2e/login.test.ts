import request from "supertest";
import mongoose from "mongoose"
import { buildApp } from "../../startup";

beforeAll(async() => {
    await mongoose.connect("mongodb://127.0.0.1:27017/GramverseTestDB");
});

afterAll(async () => {
    mongoose.disconnect();
});

const {app} = buildApp();
describe("Login", () => {
    it("should login with valid credentials", async () => {
        const credentials = {userName: "test101", password: "test101P", rememberMe: true};
        const response = await request(app)
        .post("/api/users/login")
        .send(credentials);
        expect(response.statusCode).toBe(201);
    })
})