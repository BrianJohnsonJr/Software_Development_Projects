import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SearchResults from './SearchResults';

global.fetch = jest.fn();

describe('SearchResults Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const renderSearchResultsPage = (searchTerm) => {
    const initialEntries = [`/search?searchTerm=${encodeURIComponent(searchTerm)}`];
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state correctly', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Simulate loading state

    renderSearchResultsPage('test');

    expect(screen.getByText('Loading search results...')).toBeInTheDocument();
  });

  test('displays an error message when the fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch user search results.'));
    fetch.mockRejectedValueOnce(new Error('Failed to fetch post search results.'));

    renderSearchResultsPage('test');

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch post search results.')).toBeInTheDocument();
    });
  });

  test('shows a message when no search term is provided', async () => {
    renderSearchResultsPage('');

    await waitFor(() => {
      expect(screen.getByText('Please enter a search term.')).toBeInTheDocument();
    });
  });

  test('shows a message when no results are found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    renderSearchResultsPage('nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No results found for "nonexistent".')).toBeInTheDocument();
    });
  });

  test('renders users and posts when results are available', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          {
            _id: '1',
            username: 'user1',
            image: 'user1.jpg',
            followers: [],
            following: [],
            postIds: [],
          },
        ],
      }),
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [
          {
            _id: '1',
            title: 'Post 1',
            price: 100,
            tags: ['tag1'],
            image: 'post1.jpg',
          },
        ],
      }),
    });

    renderSearchResultsPage('test');

    await waitFor(() => {
      expect(screen.getByText('Search Results for "test"')).toBeInTheDocument();

      // Check users
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByAltText("user1's profile")).toBeInTheDocument();

      // Check posts
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });
  });
});
