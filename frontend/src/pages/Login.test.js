import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom"; // for Link components
import Login from "./Login";

// Utility to render the component with routing
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Login Component", () => {
  test("renders login form", () => {
    renderWithRouter(<Login />);

    // Check that the Login header is displayed
    const loginHeader = screen.getByRole("heading", { name: /login/i });
    expect(loginHeader).toBeInTheDocument();

    // Check that the username and password inputs are rendered
    const usernameInput = screen.getByLabelText(/username:/i);
    const passwordInput = screen.getByLabelText(/password:/i);
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    // Check that the login button is rendered
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("displays error message when login fails", async () => {
    renderWithRouter(<Login />);

    // Simulate clicking the login button without filling inputs
    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    // Expect the error message to appear
    const errorMessage = await screen.findByText(/an error occurred/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("renders register link", () => {
    renderWithRouter(<Login />);

    // Check if the "Create one here" link is present
    const registerLink = screen.getByText(/create one here/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });
});
