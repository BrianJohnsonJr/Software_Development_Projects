// Import React to enable JSX usage
import React from 'react';

// Import testing utilities from React Testing Library
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Import router utilities to simulate navigation and routing in tests
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Import the component to be tested
import UniqueProfileView from './UniqueProfileView';

// Mock the global fetch function to simulate API calls
global.fetch = jest.fn(); 

// Define the test suite for the UniqueProfileView component
describe('UniqueProfileView Component', () => {
    // Run this before each test to ensure the fetch mock is reset
    beforeEach(() => {
        fetch.mockClear(); // Clear fetch mock before each test
    });

    // Test case to verify that the loading text appears initially
    it('renders loading text initially', () => {
        // Render the component with a simulated route using MemoryRouter and Routes
        render(
            <MemoryRouter initialEntries={['/users/123']}> {/* Simulate navigating to the /users/123 route */}
                <Routes> {/* Define the routes context */}
                    <Route path="/users/:userId" element={<UniqueProfileView />} /> {/* Map the route to the component */}
                </Routes>
            </MemoryRouter>
        );

        // Assert that the loading text is displayed
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('fetches and displays user data correctly', async () => {
        const mockUserData = {
            user: {
                name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                bio: 'This is a bio',
                followersCount: 10,
                postsCount: 5,
                profilePicture: 'https://via.placeholder.com/120',
            },
            isFollowing: false,
        };
    
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });
    
        render(
            <MemoryRouter initialEntries={['/users/123']}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );
    
        // Wait for profile data to load
        await waitFor(() => {
            console.log(screen.debug()); // Debug rendered output
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    
        // Check other data using flexible matchers
        expect(screen.getByText(/Username:\s*johndoe/)).toBeInTheDocument();
        expect(screen.getByText(/Email:\s*john@example.com/)).toBeInTheDocument();
        expect(screen.getByText(/Bio:\s*This is a bio/)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Followers: 10'))).toBeInTheDocument();
        expect(screen.getByText(/Posts:\s*5/)).toBeInTheDocument();
    });
    
    
    // Test case to verify follow button functionality
    it('handles follow button toggle correctly', async () => {
        // Define mock user data to be returned by the fetch call
        const mockUserData = {
            user: {
                name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                bio: 'This is a bio',
                followersCount: 10,
                postsCount: 5,
                profilePicture: 'https://via.placeholder.com/120',
            },
            isFollowing: false, // Initially, the logged-in user is not following
        };

        // Mock the resolved value of fetch to simulate the API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });

        // Render the component with a simulated route
        render(
            <MemoryRouter initialEntries={['/users/123']}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for the profile data to load and ensure the user's name is displayed
        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        // Select the follow button and verify its initial text is "Follow"
        const followButton = screen.getByRole('button', { name: 'Follow' });
        expect(followButton).toBeInTheDocument();

        // Mock the follow API call to simulate the action of following the user
        fetch.mockResolvedValueOnce({ ok: true });

        // Simulate clicking the follow button
        fireEvent.click(followButton);

        // Wait for the button text to change to "Unfollow"
        await waitFor(() => expect(screen.getByRole('button', { name: 'Unfollow' })).toBeInTheDocument());
    });

    // Test case to verify behavior when the API fetch fails
    it('handles API fetch failure gracefully', async () => {
        // Mock the resolved value of fetch to simulate a failed API response
        fetch.mockResolvedValueOnce({
            ok: false, // Simulate a non-OK response
        });

        // Render the component with a simulated route
        render(
            <MemoryRouter initialEntries={['/users/123']}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for the loading text to disappear
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        // Verify that no user data is displayed due to the failed fetch
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
});
