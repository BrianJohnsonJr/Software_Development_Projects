// Profile.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import '@testing-library/jest-dom/extend-expect';

const mockUser = {
  profilePicture: 'https://example.com/profile.jpg',
  name: 'John Doe',
  followersCount: 10,
  username: 'johndoe',
  email: 'johndoe@example.com',
  bio: 'This is my bio',
  postsCount: 5
};

// Mock fetch responses
global.fetch = jest.fn();

// Helper function to render with router context
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Profile Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading message when fetching profile data', () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    renderWithRouter(<Profile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders profile data when user is authenticated', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      })
    );
    renderWithRouter(<Profile />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.getByText('Followers:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Username: johndoe')).toBeInTheDocument();
    expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bio: This is my bio')).toBeInTheDocument();
    expect(screen.getByText('Posts: 5')).toBeInTheDocument();
  });

  test('redirects to login if user is not authenticated', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Profile />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('logout button works and redirects to login', async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ user: mockUser }) })
      )
      .mockImplementationOnce(() => Promise.resolve({ ok: true }));

    renderWithRouter(<Profile />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/account/logout', expect.any(Object)));
  });

  test('edit profile link navigates to edit profile page', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      })
    );

    renderWithRouter(<Profile />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    const editButton = screen.getByText('Edit Profile');
    expect(editButton.closest('a')).toHaveAttribute('href', '/edit-profile');
  });
});
