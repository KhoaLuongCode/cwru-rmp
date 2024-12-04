import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils'; // Import 'act' from react-dom/test-utils
import Account from '../components/Account';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom'; // Ensure jest-dom is imported for matchers

jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockImplementation((tableName) => {
      const baseMock = {
        insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            username: 'testUser',
            year: 'Sophomore',
            field_of_study: 'CS',
          },
          error: null,
        }),
      };

      if (tableName === 'profiles') {
        return {
          ...baseMock,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              username: 'testUser',
              year: 'Sophomore',
              field_of_study: 'CS',
            },
            error: null,
          }),
        };
      } else if (tableName === 'entry') {
        return {
          ...baseMock,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                professor_name: 'Dr. Smith',
                course_id: 'CS101',
                quality: 5,
                difficulty: 3,
                comment: 'Great course!',
              },
              {
                professor_name: 'Prof. Johnson',
                course_id: 'CS102',
                quality: 4,
                difficulty: 4,
                comment: '',
              },
            ],
            error: null,
          }),
        };
      } else {
        return baseMock;
      }
    }),
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../utils/Toastr', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
}));

// Mock Avatar component
jest.mock('../components/Avatar', () => (props) => (
  <div data-testid="avatar" onClick={() => props.onUpload('new-avatar-url')}>
    Upload Avatar
  </div>
));

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
    await act(async () => {
      render(<Account session={session} />);
    });

    expect(screen.getByText(/Upload Avatar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Year/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Entries/i)).toBeInTheDocument();
  });

  test('displays error when username is duplicate', async () => {
    const upsertMock = jest.fn().mockResolvedValue({
      data: [],
      error: {
        message: 'duplicate key value violates unique constraint "profiles_username_key"',
      },
    });

    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              username: 'testUser',
              year: 'Sophomore',
              field_of_study: 'CS',
            },
            error: null,
          }),
          upsert: upsertMock,
        };
      }
    });

    await act(async () => {
      render(<Account session={session} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalled();
      expect(require('../utils/Toastr').showErrorToast).toHaveBeenCalledWith(
        'This username already exists, please try another one.'
      );
    });
  });

  test('displays error when email check fails', async () => {
    const upsertMock = jest.fn().mockResolvedValue({
      data: [],
      error: {
        message: 'email_check failed',
      },
    });

    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              username: 'testUser',
              year: 'Sophomore',
              field_of_study: 'CS',
            },
            error: null,
          }),
          upsert: upsertMock,
        };
      }
    });

    await act(async () => {
      render(<Account session={session} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalled();
      expect(require('../utils/Toastr').showErrorToast).toHaveBeenCalledWith(
        'Only @case.edu email addresses are allowed. Please enter a valid email.'
      );
    });
  });

  test('handles user logout correctly', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    await act(async () => {
      render(<Account session={session} />);
    });

    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Logout/i));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  test('displays "No entries submitted yet" when entries list is empty', async () => {
    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'entry') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
    });

    await act(async () => {
      render(<Account session={session} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/No entries submitted yet./i)).toBeInTheDocument();
    });
  });

  test('submits profile info successfully', async () => {
    const upsertMock = jest.fn().mockResolvedValue({ data: [], error: null });

    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          upsert: upsertMock,
        };
      }
    });

    await act(async () => {
      render(<Account session={session} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalled();
    });
  });
});
