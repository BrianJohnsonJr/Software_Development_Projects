import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer Component", () => {
  test("renders the footer with correct text", () => {
    render(<Footer />);
    
    // Check that the footer contains the expected text
    const footerText = screen.getByText(/© 2024 Merchsy/i);
    expect(footerText).toBeInTheDocument();
  });

  test("has the correct class for styling", () => {
    render(<Footer />);
    
    // Check that the footer element has the class 'footer'
    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toHaveClass("footer");
  });
});
