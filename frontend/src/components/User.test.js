import { render, screen } from "@testing-library/react";
import UserResult from "./User";

describe("UserResult Component", () => {
  const mockUser = {
    username: "testuser",
    image: "https://example.com/testuser.png",
    followers: ["user1", "user2"],
    following: ["user3"],
    postIds: ["post1", "post2", "post3"],
  };

  test("renders user details correctly", () => {
    render(<UserResult user={mockUser} />);

    // Check username
    expect(screen.getByText("testuser")).toBeInTheDocument();

    // Check followers count
    expect(screen.getByText(/Followers:/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Check following count
    expect(screen.getByText(/Following:/i)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    // Check posts count
    expect(screen.getByText(/Posts:/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Check profile picture
    const profilePicture = screen.getByAltText("testuser's profile");
    expect(profilePicture).toHaveAttribute("src", "https://example.com/testuser.png");
  });

  test("renders default profile picture when no image is provided", () => {
    const userWithoutImage = { ...mockUser, image: null };
    render(<UserResult user={userWithoutImage} />);

    const defaultProfilePicture = screen.getByAltText("testuser's profile");
    expect(defaultProfilePicture).toHaveAttribute(
      "src",
      "https://preview.redd.it/tuya5a8s2tv71.png?width=422&format=png&auto=webp&s=b379b435e0b570d34bea7eadb00f78faa53ae98d"
    );
  });

  test("renders zero counts correctly for followers, following, and posts", () => {
    const userWithZeroCounts = {
      username: "emptyuser",
      image: null,
      followers: [],
      following: [],
      postIds: [],
    };
  
    render(<UserResult user={userWithZeroCounts} />);
  
    // Check username
    expect(screen.getByText("emptyuser")).toBeInTheDocument();
  
    // Scope the queries by parent elements to disambiguate
    const statsSection = screen.getByText("emptyuser").closest(".user-info");
  
    expect(screen.getByText("Followers:")).toBeInTheDocument();
    expect(statsSection).toHaveTextContent("Followers: 0");
  
    expect(screen.getByText("Following:")).toBeInTheDocument();
    expect(statsSection).toHaveTextContent("Following: 0");
  
    expect(screen.getByText("Posts:")).toBeInTheDocument();
    expect(statsSection).toHaveTextContent("Posts: 0");
  });
  
});
