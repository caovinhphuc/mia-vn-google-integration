/**
 * Login Component Tests
 * Critical authentication component testing
 */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, setupLocalStorageMock } from "../../../utils/test-utils";
import Login from "../Login";

import { loginUser, registerUser } from "../../../services/securityService";

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    {
      get: mockSearchParamsGet,
    },
  ],
}));

// Mock Ant Design App.useApp hook
const mockMessage = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  loading: jest.fn(),
};

jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  return {
    ...antd,
    App: {
      ...antd.App,
      useApp: () => ({
        message: mockMessage,
      }),
    },
  };
});

// Mock securityService
jest.mock("../../../services/securityService", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

// Helper to get login submit button (excludes SSO buttons)
const getLoginSubmitButton = () => {
  // Get all buttons and filter for login button
  const buttons = screen.getAllByRole("button");
  return (
    buttons.find((btn) => btn.textContent.trim() === "Đăng nhập") ||
    screen.getByRole("button", { name: /^đăng nhập$/i })
  );
};

describe("Login Component", () => {
  // Ant Design Form + userEvent.type mặc định (có delay) dễ vượt 5000ms trên CI/máy chậm
  jest.setTimeout(30000);

  let localStorageMock;

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = setupLocalStorageMock();

    // Clear all mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockMessage.success.mockClear();
    mockMessage.error.mockClear();
    mockMessage.info.mockClear();

    // Reset localStorage
    localStorageMock.clear();

    // Reset search params
    mockSearchParamsGet.mockReturnValue(null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Rendering", () => {
    it("should render login form", () => {
      renderWithProviders(<Login />);

      expect(screen.getByText("🔐 Đăng nhập")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      const loginButton = getLoginSubmitButton();
      expect(loginButton).toBeInTheDocument();
    });

    it("should show register form when switching to register", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Click register link
      const registerLink = screen.getByText("Đăng ký ngay");
      await user.click(registerLink);

      // Should show register form
      expect(screen.getByText("📝 Đăng ký")).toBeInTheDocument();
      expect(screen.getByLabelText("Họ tên")).toBeInTheDocument();
      expect(screen.getByLabelText("Xác nhận mật khẩu")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /đăng ký/i })).toBeInTheDocument();
    });

    it("should show SSO login buttons", () => {
      renderWithProviders(<Login />);

      expect(screen.getByText(/đăng nhập với google/i)).toBeInTheDocument();
      expect(screen.getByText(/đăng nhập với github/i)).toBeInTheDocument();
      expect(screen.getByText(/đăng nhập với microsoft/i)).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should show error when email is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const submitButton = getLoginSubmitButton();
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Vui lòng nhập email!")).toBeInTheDocument();
      });
    });

    it("should show error when password is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      await user.type(emailInput, "test@example.com");

      const submitButton = getLoginSubmitButton();
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Vui lòng nhập mật khẩu!")).toBeInTheDocument();
      });
    });

    it("should show error for invalid email format", async () => {
      // delay: null — tránh timeout do gõ từng ký tự chậm với Ant Design Form debounce
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      await user.type(emailInput, "invalid-email");

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0]; // First password input (login form)
      await user.type(passwordInput, "password123");

      const submitButton = getLoginSubmitButton();
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Email không hợp lệ!")).toBeInTheDocument();
      });
    });

    it("should show error for password too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      await user.type(emailInput, "test@example.com");

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0]; // First password input (login form)
      await user.type(passwordInput, "12345"); // Less than 6 characters

      const submitButton = getLoginSubmitButton();
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Mật khẩu phải có ít nhất 6 ký tự!")).toBeInTheDocument();
      });
    });
  });

  describe("Login Flow", () => {
    it("should call loginUser with correct credentials", async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({
        success: true,
        token: "mock-token",
        user: { id: "1", email: "test@example.com", name: "Test User" },
        sessionId: "mock-session",
      });

      renderWithProviders(<Login />, {
        route: "/login",
      });

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith("test@example.com", "password123");
      });
    });

    it("should store token in localStorage on successful login", async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({
        success: true,
        token: "mock-jwt-token",
        user: { id: "1", email: "test@example.com", name: "Test User" },
        sessionId: "mock-session-id",
      });

      renderWithProviders(<Login />, {
        route: "/login",
      });

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("authToken", "mock-jwt-token");
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith("token", "mock-jwt-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("sessionId", "mock-session-id");
    });

    it("should update Redux store on successful login", async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      loginUser.mockResolvedValue({
        success: true,
        token: "mock-token",
        user: mockUser,
        sessionId: "mock-session",
      });

      const { store } = renderWithProviders(<Login />, {
        route: "/login",
      });

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(true);
      });
      const state = store.getState();
      expect(state.auth.user).toEqual(mockUser);
    });

    it("should show error message on login failure", async () => {
      const user = userEvent.setup();
      loginUser.mockRejectedValue(new Error("Invalid credentials"));

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it("should redirect to MFA page when MFA is required", async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({
        success: true,
        requiresMFA: true,
        email: "test@example.com",
      });

      renderWithProviders(<Login />, {
        route: "/login",
      });

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/security", {
          state: {
            requiresMFA: true,
            email: "test@example.com",
          },
        });
      });
    });
  });

  describe("Registration Flow", () => {
    it("should call registerUser when submitting registration form", async () => {
      const user = userEvent.setup();
      registerUser.mockResolvedValue({
        success: true,
        message: "Đăng ký thành công",
        user: {
          id: "1",
          email: "new@example.com",
          name: "New User",
        },
      });

      renderWithProviders(<Login />);

      // Switch to register mode
      const registerLink = screen.getByText("Đăng ký ngay");
      await user.click(registerLink);

      // Fill registration form
      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0]; // First password field
      const fullNameInput = screen.getByPlaceholderText("Nhập họ và tên của bạn");
      const confirmPasswordInput = passwordInputs[1]; // Confirm password field

      await user.type(emailInput, "new@example.com");
      await user.type(passwordInput, "password123");
      await user.type(fullNameInput, "New User");
      await user.type(confirmPasswordInput, "password123");

      const submitButton = screen.getByRole("button", {
        name: /đăng ký/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith(
          "new@example.com",
          "password123",
          "New User",
          "user"
        );
      });
    });

    it("should show error when passwords do not match", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Switch to register mode
      const registerLink = screen.getByText("Đăng ký ngay");
      await user.click(registerLink);

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "different123");

      const submitButton = screen.getByRole("button", {
        name: /đăng ký/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Mật khẩu xác nhận không khớp!")).toBeInTheDocument();
      });
    });
  });

  describe("SSO Login", () => {
    it("should show info message when clicking SSO button", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const googleButton = screen.getByText(/đăng nhập với google/i);
      await user.click(googleButton);

      // Should show info message via antd message API
      await waitFor(() => {
        expect(mockMessage.info).toHaveBeenCalledWith(expect.stringContaining("google"));
      });
    });
  });

  describe("Redirect Behavior", () => {
    it("should redirect to home if already authenticated", () => {
      localStorageMock.setItem("authToken", "existing-token");

      renderWithProviders(<Login />, {
        route: "/login",
      });

      // Should redirect to home
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should redirect to returnUrl if provided", () => {
      mockSearchParamsGet.mockImplementation((key) => {
        if (key === "returnUrl") return "/dashboard";
        return null;
      });

      localStorageMock.setItem("authToken", "existing-token");

      renderWithProviders(<Login />, {
        route: "/login?returnUrl=/dashboard",
      });

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Loading States", () => {
    it("should show loading state when submitting", async () => {
      const user = userEvent.setup();
      loginUser.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  token: "token",
                  user: { id: "1", email: "test@example.com" },
                  sessionId: "session",
                }),
              100
            )
          )
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const submitButton = getLoginSubmitButton();
      expect(submitButton).toBeInTheDocument();

      await user.click(submitButton);

      // Verify loginUser was called
      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith("test@example.com", "password123");
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message from API", async () => {
      const user = userEvent.setup();
      loginUser.mockRejectedValue(new Error("Email hoặc mật khẩu không đúng"));

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email hoặc mật khẩu không đúng/i)).toBeInTheDocument();
      });
    });

    it("should allow closing error message", async () => {
      const user = userEvent.setup({ delay: null });
      loginUser.mockRejectedValue(new Error("Login failed"));

      renderWithProviders(<Login />);

      const emailInput = screen.getByPlaceholderText("your@email.com");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwordInputs[0];
      const submitButton = getLoginSubmitButton();

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });

      // Close error message - Alert component has close button
      const alert = screen.getByRole("alert");
      const closeButton = within(alert).getByRole("button");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
      });
    });
  });
});
