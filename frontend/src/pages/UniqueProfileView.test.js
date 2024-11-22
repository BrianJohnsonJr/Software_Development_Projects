import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UniqueProfileView from "./UniqueProfileView";

global.fetch = jest.fn();

describe("UniqueProfileView Component", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it("renders loading text initially", () => {
        render(
            <MemoryRouter initialEntries={["/users/123"]}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("fetches and displays user data correctly", async () => {
        const mockUserData = {
            user: {
                name: "John Doe",
                username: "johndoe",
                email: "john@example.com",
                bio: "This is a bio",
                followers: [],
                postIds: [1, 2, 3, 4, 5],
                profilePicture: "https://via.placeholder.com/120",
            },
            isFollowing: false,
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });

        render(
            <MemoryRouter initialEntries={["/users/123"]}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for the data to load
        await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());

        // Check username, email, and bio
        expect(screen.getByText(/Username:/)).toHaveTextContent("johndoe");
        expect(screen.getByText(/Email:/)).toHaveTextContent("john@example.com");
        expect(screen.getByText(/Bio:/)).toHaveTextContent("This is a bio");

        // Check followers and posts counts
        const followersSection = screen.getByText("Followers:").closest('p');
        expect(followersSection).toHaveTextContent("Followers: 0");

        const postsSection = screen.getByText("Posts:").closest('p');
        expect(postsSection).toHaveTextContent("Posts: 5");
    });

    it("handles follow button toggle correctly", async () => {
        const mockUserData = {
            user: {
                name: "John Doe",
                username: "johndoe",
                email: "john@example.com",
                bio: "This is a bio",
                followers: [],
                postIds: [1, 2, 3, 4, 5],
                profilePicture: "https://via.placeholder.com/120",
            },
            isFollowing: false,
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });

        render(
            <MemoryRouter initialEntries={["/users/123"]}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());
        const followButton = screen.getByRole("button", { name: "Follow" });
        expect(followButton).toBeInTheDocument();

        fetch.mockResolvedValueOnce({ ok: true });

        fireEvent.click(followButton);

        await waitFor(() => expect(screen.getByRole("button", { name: "Unfollow" })).toBeInTheDocument());
    });

    it("handles API fetch failure gracefully", async () => {
        fetch.mockResolvedValueOnce({ ok: false });

        render(
            <MemoryRouter initialEntries={["/users/123"]}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
        expect(screen.getByText("Failed to load user data")).toBeInTheDocument();
    });

    it("renders correctly when user data is incomplete", async () => {
        const mockUserData = {
            user: {
                name: "John Doe",
                username: null,
                email: null,
                bio: null,
                followers: null,
                postIds: null,
                profilePicture: null,
            },
            isFollowing: false,
        };
    
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUserData,
        });
    
        render(
            <MemoryRouter initialEntries={["/users/123"]}>
                <Routes>
                    <Route path="/users/:userId" element={<UniqueProfileView />} />
                </Routes>
            </MemoryRouter>
        );
    
        await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());
        expect(screen.getByText(/Username:/)).toHaveTextContent("N/A");
        expect(screen.getByText(/Email:/)).toHaveTextContent("N/A");
        expect(screen.getByText(/Bio:/)).toHaveTextContent("N/A");
    
        // Use more robust queries for structured DOM
        const statsContainer = screen.getByText("Followers:").closest("div");
        expect(within(statsContainer).getByText("0")).toBeInTheDocument();
    
        const postsContainer = screen.getByText("Posts:").closest("div");
        expect(within(postsContainer).getByText("0")).toBeInTheDocument();
    });
    
});
