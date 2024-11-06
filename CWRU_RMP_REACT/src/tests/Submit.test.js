// Submit.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Submit from './Submit';
import { supabase } from './supabaseClient';
import '@testing-library/jest-dom'; // Ensure jest-dom is imported for matchers

// Mock the supabase client
jest.mock('./supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signOut: jest.fn(),
    },
  },
}));

describe('Submit Component', () => {
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

  it('renders feedback form', () => {
    const { getByLabelText } = render(<Submit session={session} />);
    expect(getByLabelText(/Professor Name:/i)).toBeInTheDocument();
    // Add more assertions if necessary
  });

  it('submits feedback successfully', async () => {
    const insertMock = jest.fn().mockResolvedValue({ data: [], error: null });
    supabase.from.mockReturnValue({
      insert: insertMock,
    });

    const { getByLabelText, getByText } = render(<Submit session={session} />);

    // Fill out the form
    fireEvent.change(getByLabelText(/Professor Name:/i), { target: { value: 'Prof X' } });
    fireEvent.change(getByLabelText(/Course:/i), { target: { value: 'CSDS101' } });
    fireEvent.change(getByLabelText(/Quality \(1-5\):/i), { target: { value: '5' } });
    fireEvent.change(getByLabelText(/Difficulty \(1-5\):/i), { target: { value: '3' } });
    fireEvent.change(getByLabelText(/Comment:/i), { target: { value: 'Great professor!' } });
    fireEvent.change(getByLabelText(/Workload \(hours\/week\):/i), { target: { value: '10' } });
    fireEvent.change(getByLabelText(/Semester:/i), { target: { value: 'Fall 2023' } });

    // Submit the form
    fireEvent.click(getByText(/Submit Feedback/i));

    // Wait for the insert method to be called
    // Submit.test.js
    await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('entry');
        expect(insertMock).toHaveBeenCalledWith([
        expect.objectContaining({
            professor_name: 'Prof X',
            course_id: 'CSDS101',
            quality: Number(5),
            difficulty: Number(3), // Updated to match the input value
            comment: 'Great professor!',
            workload: Number(10), // Updated to match the input value
            semester: 'Fall 2023',
            user_id: 'user-id',
        }),
        ]);
    
        // Verify that a success alert was shown
        expect(window.alert).toHaveBeenCalledWith('Feedback submitted successfully!');
    });
  

    // Verify that form fields are reset
    expect(getByLabelText(/Professor Name:/i)).toHaveValue('');
    expect(getByLabelText(/Course:/i)).toHaveValue('');
    expect(getByLabelText(/Quality \(1-5\):/i)).toHaveValue(0);
    expect(getByLabelText(/Difficulty \(1-5\):/i)).toHaveValue(0);
    expect(getByLabelText(/Comment:/i)).toHaveValue('');
    expect(getByLabelText(/Workload \(hours\/week\):/i)).toHaveValue(0);
    expect(getByLabelText(/Semester:/i)).toHaveValue('');
    // Add more field reset assertions as needed
  });

  // Optionally, other test cases
});
