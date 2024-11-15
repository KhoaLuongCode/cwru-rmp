import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Account from '../components/Account';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom'; // Ensure jest-dom is imported for matchers

jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockImplementation((tableName) => {
      if (tableName === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  username: 'testUser',
                  year: 'Sophomore',
                  field_of_study: 'CS',
                },
                error: null,
              }),
            }),
          }),
          upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      } else if (tableName === 'entry') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      } else {
        return {
          insert: jest.fn().mockResolvedValue({ data: [], error: null }),
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
    }),
    auth: {
      signOut: jest.fn(),
    },
  },
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('Account Component', () => {
  const session = {
    user: {
      id: 'user-id',
      email: 'test@case.edu',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn(); // Mock window.alert
  });

  test('renders profile data correctly', async () => {
    render(<Account session={session} />);

    // Wait for the component to finish loading data
    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/Update/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Year/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Entries/i)).toBeInTheDocument();
  });

  test('submits profile info successfully', async () => {
    const upsertMock = jest.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            username: 'testUser',
            year: 'Sophomore',
            field_of_study: 'CS',
          },
          error: null,
        }),
      }),
    });
  
    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'profiles') {
        return {
          select: selectMock,
          upsert: upsertMock,
        };
      } else if (tableName === 'entry') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      } else {
        return {
          insert: jest.fn().mockResolvedValue({ data: [], error: null }),
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
    });
  
    render(<Account session={session} />);
  
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });
  
    // Ensure that the profile data is correctly set
    expect(screen.getByDisplayValue('testUser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sophomore')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CS')).toBeInTheDocument();
  
    // Simulate user interactions (if any changes are needed)
    // For this test, since the initial values are already correct, you might not need to change them
    // However, if you intend to modify them, ensure the changes are reflected
  
    fireEvent.click(screen.getByText(/Update/i));
  
    // Wait for async actions and check the mock calls
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles'); // Check that 'profiles' table is used
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testUser',
          year: 'Sophomore',
          field_of_study: 'CS',
          id: 'user-id',
          user_email: 'test@case.edu',
          updated_at: expect.any(Date),
        })
      );
    });
  });
  
});
