import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Explore from './Explore';
import '@testing-library/jest-dom/extend-expect';

// Mock the Post component
jest.mock('../components/Post', () => {
  return (props) => (
    <div data-testid="post">
      <h3>{props.title}</h3>
      <p>{props.description}</p>
      <p>Owner: {props.owner}</p>
      <p>Price: ${props.price}</p>
      <p>Tags: {props.tags.join(', ')}</p>
      <img src={props.image} alt={props.title} />
    </div>
  );
});

// Mock the SortFilterPanel component
jest.mock('../components/SortFilterPanel', () => {
  return ({ onSortChange, onFilterChange }) => (
    <div data-testid="sort-filter-panel">
      <button onClick={() => onSortChange('price-asc')}>Sort by Price Ascending</button>
      <button onClick={() => onFilterChange({ minPrice: 10, maxPrice: 50 })}>Filter Price Range</button>
    </div>
  );
});

const mockPosts = [
  { _id: '1', title: 'Post 1', description: 'Desc 1', owner: 'User1', price: 20, tags: ['tag1'], image: 'img1.jpg' },
  { _id: '2', title: 'Post 2', description: 'Desc 2', owner: 'User2', price: 40, tags: ['tag2'], image: 'img2.jpg' },
];

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  unobserve() {}
  disconnect() {}
};

describe('Explore Component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('renders loading message while fetching data', async () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(
      <BrowserRouter>
        <Explore />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders posts when fetched successfully', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );

    render(
      <BrowserRouter>
        <Explore />
      </BrowserRouter>
    );

    await waitFor(() => {
      const posts = screen.getAllByTestId('post');
      expect(posts).toHaveLength(mockPosts.length);
      expect(posts[0]).toHaveTextContent('Post 1');
      expect(posts[1]).toHaveTextContent('Post 2');
    });
  });

  test('renders empty feed message if no posts are available', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <BrowserRouter>
        <Explore />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('This feed is empty.')).toBeInTheDocument();
    });
  });

  test('applies sort and filter options correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );

    render(
      <BrowserRouter>
        <Explore />
      </BrowserRouter>
    );

    // Wait for initial posts to render
    await waitFor(() => {
      expect(screen.getAllByTestId('post')).toHaveLength(mockPosts.length);
    });

    // Mock the filter response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockPosts[0]]), // Return filtered posts
      })
    );

    fireEvent.click(screen.getByText('Filter Price Range'));

    // Wait for filtered posts to render
    await waitFor(() => {
      const posts = screen.getAllByTestId('post');
      expect(posts).toHaveLength(1);
      expect(posts[0]).toHaveTextContent('Post 1');
    });
  });

  test('loads more posts when scrolled to the bottom', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPosts),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPosts),
        })
      );

    render(
      <BrowserRouter>
        <Explore />
      </BrowserRouter>
    );

    // Wait for initial posts
    await waitFor(() => {
      expect(screen.getAllByTestId('post')).toHaveLength(mockPosts.length);
    });

    // Simulate scrolling to the bottom
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // Wait for additional posts
    await waitFor(() => {
      const posts = screen.getAllByTestId('post');
      expect(posts).toHaveLength(mockPosts.length * 2);
    });
  });
});
