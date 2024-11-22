import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotLoggedIn from './NotLoggedIn';
import '@testing-library/jest-dom/extend-expect';

// Helper function to render with router context
const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('NotLoggedIn Component', () => {
    test('renders the component with heading and message', () => {
        renderWithRouter(<NotLoggedIn />);

        // Check for heading
        const heading = screen.getByText('You Are Not Logged In');
        expect(heading).toBeInTheDocument();

        // Check for message
        const message = screen.getByText('Please log in to access this page.');
        expect(message).toBeInTheDocument();
    });

    test('renders Login and Register links', () => {
        renderWithRouter(<NotLoggedIn />);

        // Check for login link
        const loginLink = screen.getByText('Login');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');

        // Check for register link
        const registerLink = screen.getByText('Register');
        expect(registerLink).toBeInTheDocument();
        expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });
});
