// Event manager, sends data to db
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Avatar from './Avatar'

// Function to submit feedback
export async function submitFeedback(formData, userId) {
    try {
      const { error } = await supabase
        .from('entry') // Make sure this table name is correct
        .insert([{ ...formData, user_id: userId }]);
  
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error inserting data:', error);
      return { success: false, error };
    }
  }

  // Function to log out
export async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }