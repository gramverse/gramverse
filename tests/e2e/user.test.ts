import request from "supertest";
import {app} from "../../src/main";

describe("user", () => {
    describe("signup", () => {
        it("should return 200", async () => {
            const testUser = {
                email: "ali@gmail.com",
                userName: "ali12345",
                password: "a1b2c3d4",
            };
            await request(app).post("/users/signup").send(testUser).expect(200);
        });
    });
});
