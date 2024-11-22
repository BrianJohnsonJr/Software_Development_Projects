import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "./Register";

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Register Component", () => {
    test("renders register form", () => {
        renderWithRouter(<Register />);

        // Check for the header
        const registerHeader = screen.getByRole("heading", { name: /Register/i });
        expect(registerHeader).toBeInTheDocument();

        // Check for form fields
        expect(screen.getByLabelText(/Full Name:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Password:", { selector: 'input#password' })).toBeInTheDocument();
        expect(
            screen.getByLabelText("Confirm Password:", { selector: 'input#confirmPassword' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Profile Picture:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Bio:/i)).toBeInTheDocument();

        // Check that the Register button is rendered
        const registerButton = screen.getByRole("button", { name: /Register/i });
        expect(registerButton).toBeInTheDocument();
    });

    test("displays error when passwords do not match", async () => {
        renderWithRouter(<Register />);

        // Fill out mismatched passwords
        fireEvent.change(screen.getByLabelText("Password:", { selector: 'input#password' }), {
            target: { value: "password123" },
        });
        fireEvent.change(
            screen.getByLabelText("Confirm Password:", { selector: 'input#confirmPassword' }),
            {
                target: { value: "differentPassword" },
            }
        );

        // Submit the form
        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        // Wait for the error message
        await waitFor(() => {
            expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
        });
    });

    test("renders login link", () => {
        renderWithRouter(<Register />);

        // Check the login link
        const loginLink = screen.getByRole("link", { name: /Login here/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute("href", "/login");
    });

    test("submits form with valid inputs", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            })
        );

        renderWithRouter(<Register />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Full Name:/i), {
            target: { value: "John Doe" },
        });
        fireEvent.change(screen.getByLabelText(/Username:/i), {
            target: { value: "johndoe" },
        });
        fireEvent.change(screen.getByLabelText(/Email:/i), {
            target: { value: "johndoe@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password:", { selector: 'input#password' }), {
            target: { value: "password123" },
        });
        fireEvent.change(
            screen.getByLabelText("Confirm Password:", { selector: 'input#confirmPassword' }),
            {
                target: { value: "password123" },
            }
        );

        // Submit the form
        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        // Wait for form submission
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "/account/register",
                expect.objectContaining({
                    method: "POST",
                })
            );
        });
    });
});
