// Submit.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Submit from '../components/Submit';
import { supabase } from '../supabaseClient';
import '@testing-library/jest-dom'; // Ensure jest-dom is imported for matchers
import { showSuccessToast, showErrorToast } from '../utils/Toastr'; // Import the toast functions
import userEvent from '@testing-library/user-event';


// Mock the supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signOut: jest.fn(),
    },
  },
}));

// Mock the toast functions
jest.mock('../utils/Toastr', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
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
  });

  it('renders feedback form', () => {
    const { getByLabelText } = render(<Submit session={session} />);
    expect(getByLabelText(/Professor Name:/i)).toBeInTheDocument();
    // Add more assertions if necessary
  });

  it('handles user logout correctly', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    const { getByText } = render(<Submit session={session} />);

    // Click the "Sign Out" button
    fireEvent.click(getByText(/Sign Out/i));

    // Wait for signOut and toast to be called
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(showSuccessToast).toHaveBeenCalledWith('Successfully logged out!');
    });
  });

  it('shows error toast when submitting with invalid course_id', async () => {
    const { getByLabelText, getByText } = render(<Submit session={session} />);

    // Fill out the form with an invalid course_id
    fireEvent.change(getByLabelText(/Professor Name:/i), { target: { value: 'Harold Connamacher' } });
    fireEvent.change(getByLabelText(/Course:/i), { target: { value: 'INVALID_COURSE' } });
    fireEvent.change(getByLabelText(/Quality \(1-5\):/i), { target: { value: '5' } });
    fireEvent.change(getByLabelText(/Difficulty \(1-5\):/i), { target: { value: '3' } });
    fireEvent.change(getByLabelText(/Comment:/i), { target: { value: 'Great professor!' } });
    fireEvent.change(getByLabelText(/Workload \(hours\/week\):/i), { target: { value: '10' } });
    fireEvent.change(getByLabelText(/Semester:/i), { target: { value: 'Fall' } });

    // Submit the form
    fireEvent.click(getByText(/Submit Feedback/i));

    // Wait for the error toast to be called
    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Please select a valid course.');
    });

    // Ensure that supabase.insert was not called
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('handles Supabase insertion error correctly', async () => {
    const insertMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insertion failed' } });
    supabase.from.mockReturnValue({
      insert: insertMock,
    });

    const { getByLabelText, getByText } = render(<Submit session={session} />);

    // Fill out the form with valid data
    fireEvent.change(getByLabelText(/Professor Name:/i), { target: { value: 'Harold Connamacher' } });
    fireEvent.change(getByLabelText(/Course:/i), { target: { value: 'CSDS101' } });
    fireEvent.change(getByLabelText(/Quality \(1-5\):/i), { target: { value: '5' } });
    fireEvent.change(getByLabelText(/Difficulty \(1-5\):/i), { target: { value: '3' } });
    fireEvent.change(getByLabelText(/Comment:/i), { target: { value: 'Great professor!' } });
    fireEvent.change(getByLabelText(/Workload \(hours\/week\):/i), { target: { value: '10' } });
    fireEvent.change(getByLabelText(/Semester:/i), { target: { value: 'Fall' } });

    // Submit the form
    fireEvent.click(getByText(/Submit Feedback/i));

    // Wait for the error toast to be called
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('entry');
      expect(insertMock).toHaveBeenCalledWith([
        expect.objectContaining({
          professor_name: 'Harold Connamacher',
          course_id: 'CSDS101',
          quality: 5,
          difficulty: 3,
          comment: 'Great professor!',
          workload: 10,
          semester: 'Fall',
          user_id: 'user-id',
        }),
      ]);

      expect(showErrorToast).toHaveBeenCalledWith('Error submitting feedback');
    });

    // Ensure that form fields are not reset
    expect(getByLabelText(/Professor Name:/i)).toHaveValue('Harold Connamacher');
    expect(getByLabelText(/Course:/i)).toHaveValue('CSDS101');
    expect(getByLabelText(/Quality \(1-5\):/i)).toHaveValue('5');
    expect(getByLabelText(/Difficulty \(1-5\):/i)).toHaveValue('3');
    expect(getByLabelText(/Comment:/i)).toHaveValue('Great professor!');
    expect(getByLabelText(/Workload \(hours\/week\):/i)).toHaveValue(10);
    expect(getByLabelText(/Semester:/i)).toHaveValue('Fall');
  });

  it('updates extra_credit field correctly', () => {
    const { getByLabelText } = render(<Submit session={session} />);
    
    const extraCreditSelect = getByLabelText(/Extra Credit:/i);
    
    // Verify initial value
    expect(extraCreditSelect).toHaveValue('No'); // Initial value
  
    // Change to "Yes" using fireEvent
    fireEvent.change(extraCreditSelect, { target: { value: 'Yes' } });
    expect(extraCreditSelect).toHaveValue('Yes');
  
    // Change back to "No" using fireEvent
    fireEvent.change(extraCreditSelect, { target: { value: 'No' } });
    expect(extraCreditSelect).toHaveValue('No');
  });
  
  


  it('submits feedback successfully', async () => {
    const insertMock = jest.fn().mockResolvedValue({ data: [], error: null });
    supabase.from.mockReturnValue({
      insert: insertMock,
    });
  
    const { getByLabelText, getByText } = render(<Submit session={session} />);
  
    // Fill out the form with valid data from the options
    fireEvent.change(getByLabelText(/Professor Name:/i), { target: { value: 'Harold Connamacher' } });
    fireEvent.change(getByLabelText(/Course:/i), { target: { value: 'CSDS101' } });
    fireEvent.change(getByLabelText(/Quality \(1-5\):/i), { target: { value: '5' } });
    fireEvent.change(getByLabelText(/Difficulty \(1-5\):/i), { target: { value: '3' } });
    fireEvent.change(getByLabelText(/Comment:/i), { target: { value: 'Great professor!' } });
    fireEvent.change(getByLabelText(/Workload \(hours\/week\):/i), { target: { value: '10' } });
    fireEvent.change(getByLabelText(/Semester:/i), { target: { value: 'Fall' } });
  
    // Submit the form
    fireEvent.click(getByText(/Submit Feedback/i));
  
    // Wait for the insert method to be called
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('entry');
      expect(insertMock).toHaveBeenCalledWith([
        expect.objectContaining({
          professor_name: 'Harold Connamacher',
          course_id: 'CSDS101',
          quality: 5,
          difficulty: 3,
          comment: 'Great professor!',
          workload: 10,
          semester: 'Fall',
          user_id: 'user-id',
        }),
      ]);
  
      // Verify that a success toast was shown
      expect(showSuccessToast).toHaveBeenCalledWith('Feedback submitted successfully!');
    });
  
    // Verify that form fields are reset
    expect(getByLabelText(/Professor Name:/i)).toHaveValue('');
    expect(getByLabelText(/Course:/i)).toHaveValue('');
    expect(getByLabelText(/Quality \(1-5\):/i)).toHaveValue('');
    expect(getByLabelText(/Difficulty \(1-5\):/i)).toHaveValue('');
    expect(getByLabelText(/Comment:/i)).toHaveValue('');
    expect(getByLabelText(/Workload \(hours\/week\):/i)).toHaveValue(0);
    expect(getByLabelText(/Semester:/i)).toHaveValue('');
  });

  // Optionally, other test cases
});
