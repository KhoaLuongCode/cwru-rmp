// Search.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Search from '../components/Search';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Mock the supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => Promise.resolve({ data: [{ course_id: 'CSDS101' }], error: null }))
      }))
    }))
  }
}));


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(), 
}));

describe('Search Component', () => {
  beforeEach(() => {
    render(<Search />);
  });

  test('renders search input and button', () => {
    const inputElement = screen.getByPlaceholderText(/Search for professor name or course id.../i);
    const buttonElement = screen.getByText(/Search/i);
    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('updates searchTerm on input change', () => {
    const inputElement = screen.getByPlaceholderText(/Search for professor name or course id.../i);
    fireEvent.change(inputElement, { target: { value: 'CSDS101' } });
    expect(inputElement.value).toBe('CSDS101');
  });

  test('displays search results when search button is clicked', async () => {
    const buttonElement = screen.getByText(/Search/i);
    await act(async () => {
      fireEvent.click(buttonElement); // Simulate button click
    });

    const resultCard = await screen.findByText('CSDS101');
    expect(resultCard).toBeInTheDocument();
  });

  test('navigates to course page on card click', async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    const buttonElement = screen.getByText(/Search/i);
    await act(async () => {
      fireEvent.click(buttonElement); // Simulate button click
    });

    const resultCard = await screen.findByText('CSDS101');
    await act(async () => {
      fireEvent.click(resultCard); // Simulate button click
    });

    expect(mockNavigate).toHaveBeenCalledWith('/course/CSDS101');
  });
});
