const React = require("react");

module.exports = {
  // giữ lại các export khác nếu bạn cần
  ...jest.requireActual("antd"),

  // ép ConfigProvider luôn là component hợp lệ
  ConfigProvider: ({ children }) => React.createElement(React.Fragment, null, children),

  // message dùng trong ProtectedRoute
  message: {
    warning: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(),
  },
};
