import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      signOut: jest.fn(),
      updateUser: jest.fn().mockResolvedValue({ error: null }), // Added updateUser
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

// Mock Avatar component if necessary
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
    render(<Account session={session} />);

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
      // ... handle other tables if necessary
    });

    render(<Account session={session} />);

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

    render(<Account session={session} />);

    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalled();
      expect(require('../utils/Toastr').showErrorToast).toHaveBeenCalledWith(
        'Only @case.edu email addresses are allowed. Please enter a valid email'
      );
    });
  });

  test('display generic error', async () =>{
    const upsertMock = jest.fn().mockResolvedValue({
        data: [],
        error: {
          message: 'error',
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

      render(<Account session={session} />);

    await waitFor(() => {
      expect(screen.getByText(/Update/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Update/i));

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalled();
      expect(require('../utils/Toastr').showErrorToast).toHaveBeenCalledWith(
        'something went wrong...'
      );
    });
  });


  test('displays message when there are no entries', async () => {
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
          upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      } else if (tableName === 'entry') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      // ... handle other tables if necessary
    });

    render(<Account session={session} />);

    await waitFor(() => {
      expect(screen.getByText(/No entries submitted yet./i)).toBeInTheDocument();
    });
  });
  


  test('handles error during profile data fetching', async () => {
    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch profile' },
          }),
        };
      } else if (tableName === 'entry') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      // ... handle other tables if necessary
    });

    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Account session={session} />);

    await waitFor(() => {
      expect(consoleWarnMock).toHaveBeenCalledWith('Failed to fetch profile');
    });

    consoleWarnMock.mockRestore();
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


  it('handles user logout correctly', async () => {

    supabase.auth.signOut.mockResolvedValue({ error: null });
    const { getByText } = render(<Account session={session} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Click the "Sign Out" button
    fireEvent.click(getByText(/Logout/i));

    //Wait for signOut and toast to be called
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
