import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Following from './Following';
import '@testing-library/jest-dom/extend-expect';

// Mock the Post component
jest.mock('../components/Post', () => (props) => (
  <div data-testid="post">
    <h3>{props.title}</h3>
    <p>{props.description}</p>
    <p>Owner: {props.ownerUsername}</p>
    <p>Price: ${props.price}</p>
    <p>Tags: {props.tags.join(', ')}</p>
    <img src={props.imageUrl} alt={props.title} />
  </div>
));

// Mock the SortFilterPanel component
jest.mock('../components/SortFilterPanel', () => ({ onSortChange, onFilterChange }) => (
  <div data-testid="sort-filter-panel">
    <button onClick={() => onSortChange('price-asc')}>Sort by Price Ascending</button>
    <button onClick={() => onFilterChange({ minPrice: 10, maxPrice: 50 })}>Filter Price Range</button>
  </div>
));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPosts = [
  { id: 1, title: 'Post 1', description: 'Desc 1', ownerUsername: 'User1', price: 20, imageUrl: 'img1.jpg', tags: ['tag1'] },
  { id: 2, title: 'Post 2', description: 'Desc 2', ownerUsername: 'User2', price: 40, imageUrl: 'img2.jpg', tags: ['tag2'] },
];

describe('Following Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  test('renders loading message while fetching data', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({ ok: true }));
    
    render(
      <BrowserRouter>
        <Following />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('redirects to "NotLoggedIn" page if not authenticated', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    render(
      <BrowserRouter>
        <Following />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/not-logged-in');
    });
  });

//   test('renders posts when user is authenticated', async () => {
//     global.fetch
//       .mockImplementationOnce(() => Promise.resolve({ ok: true })) // Auth check
//       .mockImplementationOnce(() =>
//         Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve(mockPosts), // Mock posts
//         })
//       );

//     render(
//       <BrowserRouter>
//         <Following />
//       </BrowserRouter>
//     );

//     // Wait for posts to appear
//     await waitFor(() => {
//       const posts = screen.getAllByTestId('post');
//       expect(posts).toHaveLength(mockPosts.length);
//       expect(posts[0]).toHaveTextContent('Post 1');
//       expect(posts[1]).toHaveTextContent('Post 2');
//     });
//   });

  test('renders empty feed message if no posts are available', async () => {
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true })) // Auth check
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // Empty posts array
        })
      );

    render(
      <BrowserRouter>
        <Following />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('This feed is empty.')).toBeInTheDocument();
    });
  });

//   test('applies sort and filter options correctly', async () => {
//     global.fetch
//       .mockImplementationOnce(() => Promise.resolve({ ok: true })) // Auth check
//       .mockImplementationOnce(() =>
//         Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve(mockPosts), // Mock posts
//         })
//       );

//     render(
//       <BrowserRouter>
//         <Following />
//       </BrowserRouter>
//     );

//     // Wait for posts to load
//     await waitFor(() => {
//       expect(screen.getAllByTestId('post')).toHaveLength(mockPosts.length);
//     });

//     // Test sorting
//     fireEvent.click(screen.getByText('Sort by Price Ascending'));
//     await waitFor(() => {
//       const posts = screen.getAllByTestId('post');
//       expect(posts[0]).toHaveTextContent('Post 1'); // Cheaper post first
//       expect(posts[1]).toHaveTextContent('Post 2');
//     });

//     // Test filtering
//     fireEvent.click(screen.getByText('Filter Price Range'));
//     await waitFor(() => {
//       const posts = screen.getAllByTestId('post');
//       expect(posts).toHaveLength(1); // Only Post 1 matches filter range
//       expect(posts[0]).toHaveTextContent('Post 1');
//     });
//   });
});
