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
    
    // Check that the Sign In header is displayed
    const signInHeader = screen.getByText(/Sign In/i);
    expect(signInHeader).toBeInTheDocument();

    // Check that the username and password inputs are rendered
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    // Check that the login button is rendered
    const loginButton = screen.getByText(/Login/i);
    expect(loginButton).toBeInTheDocument();
  });

  test("displays error popup when login fails", () => {
    renderWithRouter(<Login />);
    
    // Simulate clicking the login button
    const loginButton = screen.getByText(/Login/i);
    fireEvent.click(loginButton);
    
    // Expect the error popup to be shown
    const errorPopup = screen.getByText(/Login Failed/i);
    expect(errorPopup).toBeInTheDocument();
  });

  test("renders register link", () => {
    renderWithRouter(<Login />);
    
    // Check if the Register link is present
    const registerLink = screen.getByText(/Register here/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
