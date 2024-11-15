import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Account from '../components/Account';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom'; // Ensure jest-dom is imported for matchers

jest.mock('../supabaseClient', () => ({
    supabase: {
        from: jest.fn().mockReturnValue({
            insert: jest.fn().mockResolvedValue({ data: [], error: null }),
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
        auth: {
            signOut: jest.fn(),
        },
    },
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
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
        // Mock supabase from call if Account fetches data
        supabase.from.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                data: [{ username: 'testuser', year: 'Sophomore', major: 'CS' }],
                error: null,
            }),
        });
    });

    test('renders profile data correctly', async () => {
        render(<Account session={session} />);
        expect(screen.getByText(/Upload/i)).toBeInTheDocument();
        expect(screen.getByText(/Update/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
        expect(screen.getByText(/Select Year/i)).toBeInTheDocument();
        expect(screen.getByText(/Your Entries/i)).toBeInTheDocument();
    });

    test('submits profile info successfully', async () => {
        // Mock supabase.from with chainable methods
        const insertMock = jest.fn().mockResolvedValue({ data: [], error: null });
        const mockUpsert = jest.fn().mockResolvedValue({ data: [], error: null });

        supabase.from.mockReturnValue({
            insert: insertMock,
            upsert: mockUpsert 
        });
    
        // Render your component and interact with the form
        const { getByLabelText, getByText } = render(<Account session={session} />);
        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testUser' } });
        fireEvent.change(screen.getByPlaceholderText(/Field of Study/i), { target: { value: 'CS' } });
    
        fireEvent.click(screen.getByText(/Update/i));
    
        // Wait for async actions and check the mock calls
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('profiles'); // Check that 'profiles' table is used
            expect(mockUpsert).toHaveBeenCalledWith([
                expect.objectContaining({
                    username: 'testUser',
                    year: '',
                    field_of_study: 'CS',
                    id: 'user-id',
                    user_email: 'test@case.edu',
                    updated_at: expect.anything()
                }),
            ]);
        });
    });
    
});
