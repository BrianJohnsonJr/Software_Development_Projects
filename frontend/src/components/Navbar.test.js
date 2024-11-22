import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Navbar Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders logo, links, search bar, and profile icon", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check logo
    const logo = screen.getByAltText(/Logo/i);
    expect(logo).toBeInTheDocument();

    // Check links
    const followingLink = screen.getByText(/Following/i);
    const exploreLink = screen.getByText(/Explore/i);
    const sellLink = screen.getByText(/Sell/i);
    const profileLink = screen.getByText("👤");

    expect(followingLink).toBeInTheDocument();
    expect(exploreLink).toBeInTheDocument();
    expect(sellLink).toBeInTheDocument();
    expect(profileLink).toBeInTheDocument();

    // Check search bar and button
    const searchBar = screen.getByPlaceholderText(/Search.../i);
    const searchButton = screen.getByText(/Search/i);
    expect(searchBar).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  test("navigates to the correct link when clicked", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const followingLink = screen.getByText(/Following/i);
    const exploreLink = screen.getByText(/Explore/i);
    const sellLink = screen.getByText(/Sell/i);

    expect(followingLink.closest("a")).toHaveAttribute("href", "/following");
    expect(exploreLink.closest("a")).toHaveAttribute("href", "/explore");
    expect(sellLink.closest("a")).toHaveAttribute("href", "/sell");
  });

  test("search input updates and navigates on enter", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Update search input
    const searchBar = screen.getByPlaceholderText(/Search.../i);
    fireEvent.change(searchBar, { target: { value: "test search" } });
    expect(searchBar.value).toBe("test search");

    // Press Enter
    fireEvent.keyDown(searchBar, { key: "Enter", code: "Enter" });

    // Ensure the correct navigation happens
    expect(mockNavigate).toHaveBeenCalledWith("/search?searchTerm=test%20search");
  });

  test("search button triggers navigation", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Update search input
    const searchBar = screen.getByPlaceholderText(/Search.../i);
    fireEvent.change(searchBar, { target: { value: "test search" } });

    // Click search button
    const searchButton = screen.getByText(/Search/i);
    fireEvent.click(searchButton);

    // Ensure the correct navigation happens
    expect(mockNavigate).toHaveBeenCalledWith("/search?searchTerm=test%20search");
  });

  test("applies active class to the correct link based on location", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <Navbar />
      </MemoryRouter>
    );

    const exploreLink = screen.getByText(/Explore/i);
    const followingLink = screen.getByText(/Following/i);
    const sellLink = screen.getByText(/Sell/i);

    // Explore should be active
    expect(exploreLink).toHaveClass("active");

    // Following and Sell should not be active
    expect(followingLink).not.toHaveClass("active");
    expect(sellLink).not.toHaveClass("active");
  });
});
