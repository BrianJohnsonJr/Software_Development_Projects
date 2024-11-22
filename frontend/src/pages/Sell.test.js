import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Sell from './Sell';

global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('Sell Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    URL.createObjectURL.mockClear();
  });

  const renderSellPage = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<Sell />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders the Sell form and elements correctly', async () => {
    fetch.mockResolvedValueOnce({ ok: true }); // Mock authentication check
    renderSellPage();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Then check for form elements
    expect(screen.getByText('Sell Your Item')).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Image/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Sizes/i)).toBeInTheDocument();
    expect(screen.getByText(/Tags \(Max 3\)/i)).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('handles image upload and previews it', async () => {
    // Mock authentication check
    fetch.mockResolvedValueOnce({ ok: true }); 
    
    // Mock URL.createObjectURL to return a predictable URL
    const mockURL = 'mocked-url';
    URL.createObjectURL.mockReturnValue(mockURL);
    
    // Render the component
    renderSellPage();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const file = new File(['sample'], 'sample.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Upload Image/i);

    // Trigger file upload
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verify URL.createObjectURL was called
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);

    // Check if preview exists
    await waitFor(() => {
      const preview = screen.getByAltText('Uploaded Preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', mockURL);
    });
  });

  test('allows adding and removing tags', async () => {
    fetch.mockResolvedValueOnce({ ok: true }); // Mock authentication check
    renderSellPage();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const tagInput = screen.getByPlaceholderText(/Enter tag/i);
    const addTagButton = screen.getByText('Add Tag');

    // Add first tag
    fireEvent.change(tagInput, { target: { value: 'Tag1' } });
    fireEvent.click(addTagButton);

    // Add second tag
    fireEvent.change(tagInput, { target: { value: 'Tag2' } });
    fireEvent.click(addTagButton);

    // Verify tags are added
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();

    // Remove first tag
    const removeTagButtons = screen.getAllByText('×');
    fireEvent.click(removeTagButtons[0]);

    // Verify first tag is removed
    expect(screen.queryByText('Tag1')).not.toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  test('submits the form with valid inputs', async () => {
    fetch.mockResolvedValueOnce({ ok: true }); // Mock authentication check
    fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ postId: '123' }) 
    }); // Mock form submission
    
    renderSellPage();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Title/i), { 
      target: { value: 'Sample Item' } 
    });
    fireEvent.change(screen.getByLabelText(/Description/i), { 
      target: { value: 'This is a sample item.' } 
    });
    fireEvent.change(screen.getByLabelText(/Price/i), { 
      target: { value: '29.99' } 
    });
    
    // Select size
    const sizeCheckbox = screen.getByLabelText('S');
    fireEvent.click(sizeCheckbox);

    // Select item type
    const typeRadio = screen.getByLabelText('T-shirt');
    fireEvent.click(typeRadio);

    // Add a tag
    const tagInput = screen.getByPlaceholderText(/Enter tag/i);
    fireEvent.change(tagInput, { target: { value: 'SampleTag' } });
    fireEvent.click(screen.getByText('Add Tag'));

    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    // Verify form submission
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/posts/create', expect.any(Object));
    });
  });

  test('redirects to "NotLoggedIn" page if not authenticated', async () => {
    fetch.mockResolvedValueOnce({ ok: false }); // Mock authentication failure
    renderSellPage();

    await waitFor(() => {
      expect(screen.queryByText('Sell Your Item')).not.toBeInTheDocument();
    });
  });
});