import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders MIA Retail app", async () => {
  render(<App />);
  const brandElement = await screen.findByText("MIA Retail", {
    selector: ".brand-text",
  });
  expect(brandElement).toBeInTheDocument();
});
