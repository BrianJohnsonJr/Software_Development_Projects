import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom"; // for Link components
import Register from "./Register";

// Utility to render the component with routing
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Register Component", () => {
  test("renders register form", () => {
    renderWithRouter(<Register />);
    
    // Check that the Sign Up header is displayed
    const signUpHeader = screen.getByText(/Sign Up/i);
    expect(signUpHeader).toBeInTheDocument();

    // Check that the username and password inputs are rendered
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    // Check that the create account button is rendered
    const createAccountButton = screen.getByText(/Create Account/i);
    expect(createAccountButton).toBeInTheDocument();
  });

  test("displays error popup when account creation fails", () => {
    renderWithRouter(<Register />);
    
    // Simulate clicking the create account button
    const createAccountButton = screen.getByText(/Create Account/i);
    fireEvent.click(createAccountButton);
    
    // Expect the error popup to be shown
    const errorPopup = screen.getByText(/Login Failed/i); 
    expect(errorPopup).toBeInTheDocument();
  });

  test("renders login link", () => {
    renderWithRouter(<Register />);
    
    // Check if the Login link is present
    const loginLink = screen.getByText(/Login/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
