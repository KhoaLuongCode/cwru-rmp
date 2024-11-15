import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CoursePage from '../components/CoursePage';  // Adjust this import path based on where the file is located
import { supabase } from '../supabaseClient';  // Mock the supabase client
import { useParams } from 'react-router-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the `supabase` client
jest.mock('../supabaseClient', () => ({
    supabase: {
        from: jest.fn((tableName) => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        then: jest.fn((resolve) => {
                            if (tableName === 'entry') {
                                resolve({
                                    data: [
                                        {
                                            entry_id: '1',
                                            course_id: 'CSDS101',
                                            quality: 4,
                                            difficulty: 3,
                                            workload: 4,
                                            professor_name: 'Dr. Smith',
                                            comment: 'Great course!',
                                            submitted_at: '2024-01-01T00:00:00Z',
                                            upvote: 0,
                                            downvote: 0,
                                        },
                                        {
                                            entry_id: '2',
                                            course_id: 'CSDS101',
                                            quality: 3,
                                            difficulty: 2,
                                            workload: 5,
                                            professor_name: 'Dr. Smith',
                                            comment: 'Good course, easy!',
                                            submitted_at: '2024-01-02T00:00:00Z',
                                            upvote: 1,
                                            downvote: 0,
                                        },
                                    ]
                                });
                            }
                        })
                    }))
                })),
            })),
        })),
    }
}));


// Mock `useParams` from `react-router-dom`
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
  }));


describe('CoursePage', () => {
    it('renders the course information and feedback data', async () => {
        const courseId = 'CSDS101';
        useParams.mockReturnValue({ courseId });
        render(
            <MemoryRouter initialEntries={[`/course/${courseId}`]}>
              <Routes>  {/* Wrap Route inside Routes */}
                <Route path="/course/:courseId" element={<CoursePage />} />  {/* Use element prop */}
              </Routes>
            </MemoryRouter>
          );
    });

    //   it('handles upvote and downvote actions', async () => {
    //     render(<CoursePage />);

    //     // Wait for the feedback data to be fetched and rendered
    //     await waitFor(() => expect(supabase.from).toHaveBeenCalledWith('entry'));

    //     // Get the upvote and downvote buttons
    //     const upvoteButton = screen.getByText('↑ Upvote (10)');
    //     const downvoteButton = screen.getByText('↓ Downvote (2)');

    //     // Simulate upvote click
    //     fireEvent.click(upvoteButton);
    //     await waitFor(() => expect(supabase.update).toHaveBeenCalledWith({
    //       upvote: 11,
    //     }));

    //     // Simulate downvote click
    //     fireEvent.click(downvoteButton);
    //     await waitFor(() => expect(supabase.update).toHaveBeenCalledWith({
    //       downvote: 3,
    //     }));
    //   });

    //   it('displays the formatted submission date correctly', async () => {
    //     render(<CoursePage />);

    //     // Wait for the feedback data to be fetched and rendered
    //     await waitFor(() => expect(supabase.from).toHaveBeenCalledWith('entry'));

    //     // Check that the date is correctly formatted
    //     expect(screen.getByText('October 2024')).toBeInTheDocument();
    //   });
});
