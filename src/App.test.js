import { render, screen } from "@testing-library/react";
import App from "./App";
import { BRAND_CONFIG } from "./config/brand";

// App: React.lazy + Suspense — findBy* để RTL bọc act, tránh warning Suspense trong test
test("renders loading then home after lazy chunks resolve", async () => {
  render(<App />);
  expect(screen.getByText("Đang tải...")).toBeInTheDocument();

  expect(
    await screen.findByRole(
      "heading",
      { name: new RegExp(BRAND_CONFIG.productName, "i") },
      { timeout: 10000 }
    )
  ).toBeInTheDocument();
});
