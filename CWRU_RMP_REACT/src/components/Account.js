import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Avatar from './Avatar';
import { showSuccessToast, showErrorToast } from '../utils/Toastr';
import '../css/Account.css';

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ username: '', avatar_url: '', year: '', field_of_study: '' });
  const [entries, setEntries] = useState([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccessToast('Successfully logged out!');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { user } = session;

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`username, avatar_url, year, field_of_study`)
          .eq('id', user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        setProfile({
          username: profileData?.username || '',
          avatar_url: profileData?.avatar_url || '',
          year: profileData?.year || '',
          field_of_study: profileData?.field_of_study || '',
        });

        // Fetch related entries
        const { data: entriesData, error: entriesError } = await supabase
          .from('entry')
          .select(`entry_id, professor_name, course_id, quality, difficulty, comment, submitted_at`)
          .eq('user_id', user.id);
        if (entriesError) throw entriesError;

        // Sort entries by submitted_at in descending order
        const sortedEntries = (entriesData || []).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        setEntries(sortedEntries);
      } catch (error) {
        console.warn(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const { user } = session;

      const profileUpdates = {
        id: user.id,
        user_email: user.email,
        ...updates,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(profileUpdates);
      if (error) {
        if (error.message.includes("duplicate key value violates unique constraint \"profiles_username_key\"")) {
          showErrorToast("This username already exists, please try another one.");
        } else {
          throw error;
        }
      } else {
        showSuccessToast("Your profile has been updated successfully.");
      }
    } catch (error) {
      if (error.message.includes("email_check")) {
        showErrorToast('Only @case.edu email addresses are allowed. Please enter a valid email.');
      } else {
        showErrorToast('Something went wrong...');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      const { user } = session;
      const { error } = await supabase
        .from('entry')
        .delete()
        .eq('entry_id', entryId)
        .eq('user_id', user.id);
      if (error) throw error;

      setEntries((prevEntries) => prevEntries.filter((entry) => entry.entry_id !== entryId));
      showSuccessToast('Entry deleted successfully.');
    } catch (error) {
      console.warn(error.message);
      showErrorToast('Failed to delete entry.');
    }
  };

  const { username, avatar_url, year, field_of_study } = profile;

  return (
    <div className="account-container">
      <div className="form-widget">
        <Avatar url={avatar_url} size={100} onUpload={(url) => updateProfile({ avatar_url: url })} />
        <div className="profile-info">
          <input
            type="text"
            value={username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            placeholder="Username"
            className="input-field"
          />
          <select
            value={year}
            onChange={(e) => setProfile({ ...profile, year: e.target.value })}
            className="input-field"
            placeholder="Select Year"
          >
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
          <input
            type="text"
            value={field_of_study}
            onChange={(e) => setProfile({ ...profile, field_of_study: e.target.value })}
            placeholder="Field of Study"
            className="input-field"
          />
        </div>
        <button
          onClick={() => updateProfile({ username, year, field_of_study })}
          disabled={loading}
          className="update-button"
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div className="entries">
        <h3>Your Entries</h3>
        {entries.length === 0 ? (
          <p>No entries submitted yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.entry_id} className="entry-card">
              <div className="entry-header">
                <h4>{entry.professor_name}</h4>
                <span className="course-id">{entry.course_id}</span>
              </div>
              <div className="entry-body">
                <div className="ratings">
                  <span>Quality: {entry.quality}</span>
                  <span>Difficulty: {entry.difficulty}</span>
                </div>
                <p className="comment">{entry.comment ? entry.comment : 'No comments'}</p>
              </div>
              <span className="submitted-date">{formatDate(entry.submitted_at)}</span>
              <div className="entry-footer">
                <button
                  onClick={() => deleteEntry(entry.entry_id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="logout-section">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
