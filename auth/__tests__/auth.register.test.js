import request from "supertest";
import app from "../src/app.js";
import userModel from "../src/models/user.model.js";
import { connectToMockDB, disconnectFromMockDB, clearDatabase } from "../test/setup.js";

describe("Auth Register Endpoint", () => {
  beforeAll(async () => {
    await connectToMockDB();
  });

  afterAll(async () => {
    await disconnectFromMockDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("POST /auth/register", () => {
    it("should successfully register a new user", async () => {
      const newUser = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
        firstname: "John",
        lastname: "Doe",
        role: "user",
      };

      const response = await request(app).post("/auth/register").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(newUser.username);
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it("should hash the password correctly", async () => {
      const newUser = {
        username: "testuser2",
        email: "test2@example.com",
        password: "Password123",
        firstname: "Jane",
        lastname: "Doe",
      };

      await request(app).post("/auth/register").send(newUser);

      const savedUser = await userModel.findOne({ email: newUser.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.password).not.toBe(newUser.password); // Password should be hashed
      expect(savedUser.password.length).toBeGreaterThan(20); // Bcrypt hashes are long
    });

    it("should return 400 when required fields are missing", async () => {
      const incompleteUser = {
        username: "testuser",
        email: "test@example.com",
        // missing password
        firstname: "John",
        lastname: "Doe",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 400 when email is missing", async () => {
      const incompleteUser = {
        username: "testuser",
        password: "Password123",
        firstname: "John",
        lastname: "Doe",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 400 when username is missing", async () => {
      const incompleteUser = {
        email: "test@example.com",
        password: "Password123",
        firstname: "John",
        lastname: "Doe",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 409 when user with same email already exists", async () => {
      const firstUser = {
        username: "user1",
        email: "duplicate@example.com",
        password: "Password123",
        firstname: "John",
        lastname: "Doe",
      };

      // Register first user
      await request(app).post("/auth/register").send(firstUser);

      // Try to register with same email
      const secondUser = {
        username: "user2",
        email: "duplicate@example.com",
        password: "Password456",
        firstname: "Jane",
        lastname: "Smith",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(secondUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "User already exists with this email or username",
      );
    });

    it("should return 409 when user with same username already exists", async () => {
      const firstUser = {
        username: "duplicate",
        email: "user1@example.com",
        password: "Password123",
        firstname: "John",
        lastname: "Doe",
      };

      // Register first user
      await request(app).post("/auth/register").send(firstUser);

      // Try to register with same username
      const secondUser = {
        username: "duplicate",
        email: "user2@example.com",
        password: "Password456",
        firstname: "Jane",
        lastname: "Smith",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(secondUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "User already exists with this email or username",
      );
    });

    it("should set role to 'user' by default when not provided", async () => {
      const newUser = {
        username: "testuser3",
        email: "test3@example.com",
        password: "Password123",
        firstname: "Bob",
        lastname: "Johnson",
        // role not provided
      };

      const response = await request(app).post("/auth/register").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe("user");
    });

    it("should allow setting role to 'seller' if provided", async () => {
      const newUser = {
        username: "seller1",
        email: "seller@example.com",
        password: "Password123",
        firstname: "Alice",
        lastname: "Smith",
        role: "seller",
      };

      const response = await request(app).post("/auth/register").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe("seller");
    });

    it("should store fullName with firstname and lastname", async () => {
      const newUser = {
        username: "testuser4",
        email: "test4@example.com",
        password: "Password123",
        firstname: "Chris",
        lastname: "Davis",
      };

      await request(app).post("/auth/register").send(newUser);

      const savedUser = await userModel.findOne({ email: newUser.email });
      expect(savedUser.fullName.firstname).toBe(newUser.firstname);
      expect(savedUser.fullName.lastname).toBe(newUser.lastname);
    });

    it("should return 500 on server error", async () => {
      // Mock userModel.create to throw an error
      jest
        .spyOn(userModel, "create")
        .mockRejectedValueOnce(new Error("DB Error"));

      const newUser = {
        username: "testuser5",
        email: "test5@example.com",
        password: "Password123",
        firstname: "Dave",
        lastname: "Wilson",
      };

      const response = await request(app).post("/auth/register").send(newUser);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });

    it("should accept requests with additional fields (should not fail)", async () => {
      const newUser = {
        username: "testuser6",
        email: "test6@example.com",
        password: "Password123",
        firstname: "Eve",
        lastname: "Brown",
        addresses: [
          {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "USA",
          },
        ],
      };

      const response = await request(app).post("/auth/register").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
