import { render, screen, fireEvent } from "@testing-library/react";
import Likes from "./Likes";

describe("Likes Component", () => {
  test("renders the like button with initial state", () => {
    render(<Likes />);
    
    // Check that the button is rendered with the initial likes count
    const likeButton = screen.getByRole("button", { name: /❤️ 0/i });
    expect(likeButton).toBeInTheDocument();
  });

  test("increments likes when the button is clicked", () => {
    render(<Likes />);
    
    // Get the button
    const likeButton = screen.getByRole("button", { name: /❤️ 0/i });

    // Simulate clicking the button
    fireEvent.click(likeButton);

    // Check that the likes count is updated
    expect(likeButton).toHaveTextContent("❤️ 1");
    
    // Click again to ensure further increments
    fireEvent.click(likeButton);
    expect(likeButton).toHaveTextContent("❤️ 2");
  });
});
