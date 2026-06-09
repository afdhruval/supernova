import request from "supertest";
import app from "../src/app.js";
import userModel from "../src/models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../src/db/config.js";
import { connectToMockDB, disconnectFromMockDB, clearDatabase } from "../test/setup.js";

describe("Auth Me Endpoint", () => {
  beforeAll(async () => {
    await connectToMockDB();
  });

  afterAll(async () => {
    await disconnectFromMockDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("GET /api/auth/me", () => {
    it("should successfully retrieve the profile of the logged-in user with valid token", async () => {
      const user = await userModel.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123",
        fullName: {
          firstname: "John",
          lastname: "Doe",
        },
        role: "user",
      });

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email,
          username: user.username,
        },
        config.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(user.username);
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it("should return 401 when no token is provided", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token not found");
    });

    it("should return 401 when an invalid token is provided", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", ["token=invalidtoken123"]);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Unauthorized or invalid token");
    });

    it("should return 404 when user does not exist in the database", async () => {
      // Create a fake ID that has correct MongoDB ObjectId structure
      const fakeId = "60c72b2f9b1d8e2568d71234";

      const token = jwt.sign(
        {
          id: fakeId,
          role: "user",
          email: "fake@example.com",
          username: "fakeuser",
        },
        config.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 when database error occurs during user retrieval", async () => {
      const user = await userModel.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123",
        fullName: {
          firstname: "John",
          lastname: "Doe",
        },
        role: "user",
      });

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email,
          username: user.username,
        },
        config.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      // Mock userModel.findById to fail
      jest
        .spyOn(userModel, "findById")
        .mockRejectedValueOnce(new Error("DB Error"));

      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });
});
