import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SingleItem from './SingleItem';

// Mock fetch globally
global.fetch = jest.fn();

describe('SingleItem Component', () => {
  const mockPost = {
    title: 'Sample Post',
    price: 49.99,
    image: 'https://example.com/image.jpg',
    description: 'This is a sample post description.',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    owner: { username: 'user123' },
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const renderWithRouter = (state) => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/items/1', state }]}>
        <Routes>
          <Route path="/items/:id" element={<SingleItem />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders post details when post data is available', () => {
    renderWithRouter({ post: mockPost });

    // Check if the title, price, and description are displayed
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(`$${mockPost.price}`)).toBeInTheDocument();
    expect(screen.getByText(mockPost.description)).toBeInTheDocument();

    // Check if image is rendered with the correct src and alt attributes
    const image = screen.getByAltText(mockPost.title);
    expect(image).toBeInTheDocument();
    expect(image.src).toBe(mockPost.image);

    // Check if tags are rendered correctly - using a more flexible approach
    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText(mockPost.tags.join(', '))).toBeInTheDocument();

    // Check if owner username is displayed - using a more flexible approach
    expect(screen.getByText('Owned by:')).toBeInTheDocument();
    expect(screen.getByText(mockPost.owner.username)).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /purchase/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  test('renders "Post not found" message when no post data is available', async () => {
    // Mock the fetch to return null data
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ post: null })
      })
    );

    renderWithRouter({ post: null });

    // First, we should see loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then wait for the post not found message
    await waitFor(() => {
      expect(screen.getByText('Post not found')).toBeInTheDocument();
    });
  });

  // Add a new test for network error handling
  test('renders error message when network request fails', async () => {
    // Mock the fetch to simulate a network error
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    renderWithRouter({ post: null });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});