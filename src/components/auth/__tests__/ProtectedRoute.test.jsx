import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import ProtectedRoute from "../ProtectedRoute";

/**
 * IMPORTANT:
 * test-utils.js dùng <ConfigProvider ...> từ "antd"
 * => mock "antd" PHẢI export ConfigProvider hợp lệ
 */
jest.mock("antd", () => {
  const React = require("react");
  return {
    __esModule: true,
    // nếu nơi khác có import named, cứ export đủ
    ConfigProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    message: {
      warning: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      loading: jest.fn(),
    },
  };
});

// Mock Loading để có testid ổn định
jest.mock("../../Common/Loading", () => {
  const React = require("react");
  return function MockLoading({ text }) {
    return React.createElement("div", { "data-testid": "loading" }, text);
  };
});

// Mock Navigate + useLocation
jest.mock("react-router-dom", () => {
  const React = require("react");
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => React.createElement("div", { "data-testid": "navigate" }, to),
    useLocation: () => ({ pathname: "/dashboard" }),
  };
});

// Mock logout thunk creator
const mockLogoutCreator = jest.fn(() => async () => {});
jest.mock("../../../store/actions/authActions", () => ({
  ...jest.requireActual("../../../store/actions/authActions"),
  logout: (...args) => mockLogoutCreator(...args),
}));

const authedWithSession = {
  auth: { isAuthenticated: true, sessionId: "s1" },
};

function mockFetchOnceJson(data, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  });
}

function mockFetchOnceReject(err) {
  global.fetch = jest.fn().mockRejectedValueOnce(err);
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test("Loading: show loading initially", () => {
    // fetch pending để ProtectedRoute vẫn đang checking => Loading còn tồn tại
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialState: authedWithSession }
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("Đang kiểm tra phiên đăng nhập...");
  });

  test("Valid session: render children", async () => {
    mockFetchOnceJson({ valid: true, success: true });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialState: authedWithSession }
    );

    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
    expect(mockLogoutCreator).not.toHaveBeenCalled();
    expect(screen.queryByTestId("navigate")).toBeNull();
  });

  test("Invalid session: logout(false) + navigate login", async () => {
    mockFetchOnceJson({ valid: false, success: false });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialState: authedWithSession }
    );

    await waitFor(() => expect(mockLogoutCreator).toHaveBeenCalledWith(false));

    const nav = await screen.findByTestId("navigate");
    expect(nav.textContent).toMatch(/^\/login\?returnUrl=/);
  });

  test("401 Unauthorized: logout(false) + navigate login", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialState: authedWithSession }
    );

    await waitFor(() => expect(mockLogoutCreator).toHaveBeenCalledWith(false));

    const nav = await screen.findByTestId("navigate");
    expect(nav.textContent).toMatch(/^\/login\?returnUrl=/);
  });

  test("Network error (backend down): allow access", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockFetchOnceReject(new Error("Network error"));

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialState: authedWithSession }
    );

    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
    expect(mockLogoutCreator).not.toHaveBeenCalled();
    expect(screen.queryByTestId("navigate")).toBeNull();

    spy.mockRestore();
  });
});
