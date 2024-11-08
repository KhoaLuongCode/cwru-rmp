// Search.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Search from '../components/Search';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Mock the supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn((tableName) => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => {
          // Mock data based on the table name
          if (tableName === 'courses') {
            return Promise.resolve({ data: [{ course_id: 'CSDS101' }], error: null });
          } else if (tableName === 'professors') {
            return Promise.resolve({ data: [{ first_name: 'Harold'}], error: null });
          }
          return Promise.resolve({ data: [], error: null }); 
        }),
      })),
    })),
  },
}));



jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Search Component', () => {
  beforeEach(() => {
    render(<Search />);
  });

  test('renders search input and button', async () => {
    const inputElement = screen.getByPlaceholderText(/Search for professor name.../i);
    const buttonElement = screen.getByText("Search");
    const searchByCourseButtonElement = screen.getByText(/Search by Course/i);
    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
    expect(searchByCourseButtonElement).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(searchByCourseButtonElement); // Simulate button click
    });
    const courseInput = screen.getByPlaceholderText(/Search for course ID.../i);
    const searchByProfButtonElement = screen.getByText(/Search by Professor/i);
    expect(courseInput).toBeInTheDocument();
    expect(searchByProfButtonElement).toBeInTheDocument();

  });


  test('updates searchTerm on input change', () => {
    const inputElement = screen.getByPlaceholderText(/Search for professor name.../i);
    fireEvent.change(inputElement, { target: { value: 'Harold' } });
    expect(inputElement.value).toBe('Harold');
  });

  test('displays course search results when search button is clicked', async () => {
    const buttonElement = screen.getByText("Search");
    const searchByCourseButtonElement = screen.getByText(/Search by Course/i);
    await act(async () => {
      fireEvent.click(searchByCourseButtonElement); // Simulate button click
    });

    await act(async () => {
      fireEvent.click(buttonElement); // Simulate button click
    });

    const resultCard = await screen.findByText('CSDS101');
    expect(resultCard).toBeInTheDocument();
  });

  // test('displays professor search results when search button is clicked', async () => {
  //   const buttonElement = screen.getByText("Search");

  //   await act(async () => {
  //     fireEvent.click(buttonElement); // Simulate button click
  //   });

  //   const resultCard = await screen.findByText(/Harold/i);
  //   expect(resultCard).toBeInTheDocument();
  // });

  test('displays course search results when enter is clicked', async () => {
    const searchInput = screen.getByPlaceholderText(/Search for/i);
    const searchByCourseButtonElement = screen.getByText(/Search by Course/i);
    await act(async () => {
      fireEvent.click(searchByCourseButtonElement); // Simulate button click
    });
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'CS101' } });
     fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    });
    const resultCard = await screen.findByText('CSDS101');
    expect(resultCard).toBeInTheDocument();
  });

  test('navigates to course page on card click', async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    const searchByCourseButtonElement = screen.getByText(/Search by Course/i);
    await act(async () => {
      fireEvent.click(searchByCourseButtonElement); // Simulate button click
    });

    const buttonElement = screen.getByText("Search");
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
