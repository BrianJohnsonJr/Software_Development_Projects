import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SingleItem from './SingleItem';

describe('SingleItem Component', () => {
  const mockPost = {
    title: 'Sample Post',
    price: 49.99,
    imageUrl: 'https://example.com/image.jpg',
    description: 'This is a sample post description.',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    ownerUsername: 'user123'
  };

  // Helper function to render component with mocked location state
  const renderWithRouter = (state) => {
    render(
      <MemoryRouter initialEntries={[{ state }]}>
        <Routes>
          <Route path="/" element={<SingleItem />} />
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
    expect(image.src).toBe(mockPost.imageUrl);

    // Check if tags are rendered correctly
    mockPost.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    // Check if owner username is displayed
    expect(screen.getByText(`Owned by: ${mockPost.ownerUsername}`)).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /purchase/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  test('renders "Post not found" message when no post data is available', () => {
    renderWithRouter({ post: null });

    // Verify the "Post not found" message is shown
    expect(screen.getByText(/post not found/i)).toBeInTheDocument();
  });
});
