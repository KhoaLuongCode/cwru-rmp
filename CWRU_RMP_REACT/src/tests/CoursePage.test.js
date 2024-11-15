// src/tests/CoursePage.test.js

// 1. Mock react-router-dom before importing anything
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
  }));
  
  // 2. Define initial mock data
  let mockData = [
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
      profiles: { username: 'user2' },
    },
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
      profiles: { username: 'user1' },
    },
  ];
  
  // 3. Mock supabaseClient before importing components that use it
  jest.mock('../supabaseClient', () => {
    const fromReturnObject = {
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      })),
      update: jest.fn((updates) => ({
        eq: jest.fn().mockImplementation((field, value) => {
          if (field === 'entry_id') {
            const entry = mockData.find((item) => item.entry_id === value);
            if (entry) {
              Object.assign(entry, updates);
              return Promise.resolve({ data: [entry], error: null });
            }
          }
          return Promise.resolve({ data: null, error: 'Update failed' });
        }),
      })),
    };
  
    return {
      supabase: {
        from: jest.fn(() => fromReturnObject),
      },
    };
  });
  
  // 4. Now import the necessary modules
  import React from 'react';
  import {
    render,
    screen,
    waitFor,
    fireEvent,
    within,
  } from '@testing-library/react';
  import CoursePage from '../components/CoursePage';
  import { supabase } from '../supabaseClient';
  import { useParams } from 'react-router-dom';
  import { MemoryRouter, Routes, Route } from 'react-router-dom';
  
  describe('CoursePage', () => {
    beforeEach(() => {
      // Reset mock data before each test
      mockData = [
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
          profiles: { username: 'user2' },
        },
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
          profiles: { username: 'user1' },
        },
      ];
  
      // Clear all instances and calls to constructor and all methods:
      supabase.from.mockClear();
      supabase.from().select.mockClear();
      supabase.from().select().eq.mockClear();
      supabase.from().update.mockClear();
      supabase.from().update().eq.mockClear();
    });
  
    it('renders the course information and feedback data', async () => {
      const courseId = 'CSDS101';
      useParams.mockReturnValue({ courseId });
  
      render(
        <MemoryRouter initialEntries={[`/course/${courseId}`]}>
          <Routes>
            <Route path="/course/:courseId" element={<CoursePage />} />
          </Routes>
        </MemoryRouter>
      );
  
      // Verify that the course title is rendered
      expect(screen.getByText(courseId)).toBeInTheDocument();
  
      // Wait for the feedback data to be fetched and rendered
      await waitFor(() => expect(supabase.from).toHaveBeenCalledWith('entry'));
  
      // Check if feedback entries are rendered
      expect(screen.getByText('Good course, easy!')).toBeInTheDocument();
      expect(screen.getByText('Great course!')).toBeInTheDocument();
  
      // Check if average scores are displayed
      expect(screen.getByText('Average Quality: 3.50')).toBeInTheDocument();
      expect(screen.getByText('Average Difficulty: 2.50')).toBeInTheDocument();
    });
  
    it('handles upvote and downvote actions', async () => {
      const courseId = 'CSDS101';
      useParams.mockReturnValue({ courseId });
  
      render(
        <MemoryRouter initialEntries={[`/course/${courseId}`]}>
          <Routes>
            <Route path="/course/:courseId" element={<CoursePage />} />
          </Routes>
        </MemoryRouter>
      );
  
      // Wait for the feedback data to be fetched and rendered
      await waitFor(() => expect(screen.getByText('Good course, easy!')).toBeInTheDocument());
  
      // Find the feedback entry for user1
      const user1Entry = screen.getAllByText('user1')[0].closest('.result-card');
  
      // Check initial upvote and downvote counts for user1's feedback
      expect(user1Entry).toBeInTheDocument();
      expect(within(user1Entry).getByText('↑ Upvote (0)')).toBeInTheDocument();
      expect(within(user1Entry).getByText('↓ Downvote (0)')).toBeInTheDocument();
  
      // Simulate an upvote for user1's feedback
      const upvoteButton = within(user1Entry).getByText('↑ Upvote (0)');
      fireEvent.click(upvoteButton);
  
      // Wait for the UI to update after upvote
      await waitFor(() => expect(within(user1Entry).getByText('↑ Upvote (1)')).toBeInTheDocument());
  
      // Check that the update was called correctly
      expect(supabase.from).toHaveBeenCalledWith('entry');
      expect(supabase.from().update).toHaveBeenCalledWith({ upvote: 1 });
  
      // Simulate a downvote for user1's feedback
      const downvoteButton = within(user1Entry).getByText('↓ Downvote (0)');
      fireEvent.click(downvoteButton);
  
      // Wait for the UI to update after downvote
      await waitFor(() => expect(within(user1Entry).getByText('↓ Downvote (1)')).toBeInTheDocument());
  
      // Check that the update was called correctly
      expect(supabase.from).toHaveBeenCalledWith('entry');
      expect(supabase.from().update).toHaveBeenCalledWith({ downvote: 1 });
    });
  
    
  });
  