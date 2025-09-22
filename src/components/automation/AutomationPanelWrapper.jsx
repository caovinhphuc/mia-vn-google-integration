import React from "react";
import { ConfigProvider, App } from "antd";
import viVN from "antd/locale/vi_VN";
import SimpleAutomationPanel from "./SimpleAutomationPanel";

const AutomationPanelWrapper = () => {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 8,
        },
      }}
    >
      <App>
        <SimpleAutomationPanel />
      </App>
    </ConfigProvider>
  );
};

export default AutomationPanelWrapper;
