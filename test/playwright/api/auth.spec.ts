import { test, expect } from "./utils/fixtures";
import { RequestHandler } from "./utils/request-handler";
import { APILogger } from "./utils/logger";

// Use Netlify dev port for API tests
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8888/api";

test.describe("Authentication Endpoints", () => {
  let api: RequestHandler;
  let testUser: { username: string; email: string; password: string };
  let sessionCookie: string | null = null;

  test.beforeEach(async ({ request }) => {
    const logger = new APILogger();
    api = new RequestHandler(request, logger, API_BASE_URL);
    testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: "TestPassword123!",
    };
  });

  test("POST /api/auth/register - should create a new user", async () => {
    const response = await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    expect(response).toHaveProperty("id");
    expect(response.username).toBe(testUser.username);
    expect(response.email).toBe(testUser.email);
    expect(response).not.toHaveProperty("password_hash");
  });

  test("POST /api/auth/register - should reject duplicate username", async () => {
    // Register first user
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    // Try to register with same username
    const response = await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: `different_${testUser.email}`,
        password: testUser.password,
      })
      .postRequest(409);

    expect(response).toHaveProperty("error");
  });

  test("POST /api/auth/register - should reject duplicate email", async () => {
    // Register first user
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    // Try to register with same email
    const response = await api
      .path("/auth/register")
      .body({
        username: `different_${testUser.username}`,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(409);

    expect(response).toHaveProperty("error");
  });

  test("POST /api/auth/register - should validate password length", async () => {
    const response = await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: "short",
      })
      .postRequest(400);

    expect(response).toHaveProperty("error");
  });

  test("POST /api/auth/login - should login with email", async () => {
    // Register first
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    // Login
    const response = await api
      .path("/auth/login")
      .body({
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(200);

    expect(response).toHaveProperty("id");
    expect(response.email).toBe(testUser.email);
  });

  test("POST /api/auth/login - should login with username", async () => {
    // Register first
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    // Login
    const response = await api
      .path("/auth/login")
      .body({
        username: testUser.username,
        password: testUser.password,
      })
      .postRequest(200);

    expect(response).toHaveProperty("id");
    expect(response.username).toBe(testUser.username);
  });

  test("POST /api/auth/login - should reject invalid credentials", async () => {
    const response = await api
      .path("/auth/login")
      .body({
        email: testUser.email,
        password: "WrongPassword",
      })
      .postRequest(401);

    expect(response).toHaveProperty("error");
  });

  test("GET /api/auth/me - should return current user when authenticated", async () => {
    // Register and login
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    const loginResponse = await api
      .path("/auth/login")
      .body({
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(200);

    // Get session cookie from login response headers
    // Note: In real implementation, cookies are set automatically by browser
    // For API tests, we need to extract and pass the cookie
    const meResponse = await api.path("/auth/me").getRequest(200);

    expect(meResponse).toHaveProperty("id");
    expect(meResponse.email).toBe(testUser.email);
  });

  test("GET /api/auth/me - should return 401 when not authenticated", async () => {
    const response = await api.path("/auth/me").getRequest(401);
    expect(response).toHaveProperty("error");
  });

  test("PUT /api/auth/profile - should update user profile", async () => {
    // Register and login
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    await api
      .path("/auth/login")
      .body({
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(200);

    // Update profile
    const newUsername = `updated_${testUser.username}`;
    const response = await api
      .path("/auth/profile")
      .body({
        username: newUsername,
      })
      .putRequest(200);

    expect(response.username).toBe(newUsername);
  });

  test("POST /api/auth/logout - should logout successfully", async () => {
    // Register and login
    await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    await api
      .path("/auth/login")
      .body({
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(200);

    // Logout
    const response = await api.path("/auth/logout").postRequest(200);
    expect(response).toHaveProperty("message");
  });
});
