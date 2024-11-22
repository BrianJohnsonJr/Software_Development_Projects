import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Post from "./Post";

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Post Component", () => {
  const mockPost = {
    id: "1",
    title: "Sample Post",
    description: "This is a sample post description.",
    owner: { username: "JohnDoe", _id: "123" },
    price: "29.99",
    image: "https://via.placeholder.com/150",
    tags: ["Tag1", "Tag2"],
  };

  test("renders post details", () => {
    renderWithRouter(<Post {...mockPost} />);
    
    // Check title
    expect(screen.getByText("Sample Post")).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText("This is a sample post description.")).toBeInTheDocument();
    
    // Check price
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    
    // Check owner
    expect(screen.getByText("Owned by:")).toBeInTheDocument();
    expect(screen.getByText("JohnDoe")).toBeInTheDocument();
    
    // Check tags
    expect(screen.getByText("Tag1")).toBeInTheDocument();
    expect(screen.getByText("Tag2")).toBeInTheDocument();
  });

  test("renders default placeholder image if no image is provided", () => {
    const postWithoutImage = { ...mockPost, image: null };
    renderWithRouter(<Post {...postWithoutImage} />);
    
    const imageElement = screen.getByAltText("Sample Post");
    expect(imageElement).toHaveAttribute("src", "https://via.placeholder.com/150");
  });

  test("renders 'No tags available' if tags are empty", () => {
    const postWithoutTags = { ...mockPost, tags: [] };
    renderWithRouter(<Post {...postWithoutTags} />);
    
    expect(screen.getByText("No tags available")).toBeInTheDocument();
  });

  test("links to the correct post page", () => {
    renderWithRouter(<Post {...mockPost} />);
    
    const postLink = screen.getByRole("link", { name: /sample post/i });
    expect(postLink).toHaveAttribute("href", "/posts/1");
  });

  test("links to the owner's profile page", () => {
    renderWithRouter(<Post {...mockPost} />);
    
    const profileLink = screen.getByRole("link", { name: /johndoe/i });
    expect(profileLink).toHaveAttribute("href", "/profile/123");
  });

  test("renders the Likes component", () => {
    renderWithRouter(<Post {...mockPost} />);
    
    const likeButton = screen.getByRole("button", { name: /❤️ 0/i });
    expect(likeButton).toBeInTheDocument();
  });
});
