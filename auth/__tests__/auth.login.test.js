import request from "supertest";
import app from "../src/app.js";
import userModel from "../src/models/user.model.js";
import bcryptjs from "bcryptjs";
import { connectToMockDB, disconnectFromMockDB, clearDatabase } from "../test/setup.js";

describe("Auth Login Endpoint", () => {
  beforeAll(async () => {
    await connectToMockDB();
  });

  afterAll(async () => {
    await disconnectFromMockDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("POST /api/auth/login", () => {
    it("should successfully login an existing user", async () => {
      const password = "Pass123";
      const hashedPassword = await bcryptjs.hash(password, 10);

      const user = await userModel.create({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        fullName: {
          firstname: "John",
          lastname: "Doe",
        },
        role: "user",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User logged in successfully");
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(user.username);
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.password).toBeUndefined();

      // Verify cookie is set
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.startsWith("token="))).toBe(true);
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          password: "Pass123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 400 when password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 401 when user does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Pass123",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 401 when password is incorrect", async () => {
      const correctPassword = "Pass123";
      const hashedPassword = await bcryptjs.hash(correctPassword, 10);

      await userModel.create({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        fullName: {
          firstname: "John",
          lastname: "Doe",
        },
        role: "user",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "WrongPassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 500 on server error", async () => {
      jest
        .spyOn(userModel, "findOne")
        .mockReturnValueOnce({
          select: jest.fn().mockRejectedValueOnce(new Error("DB Error"))
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "Pass123",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });
});
