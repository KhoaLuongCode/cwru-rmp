import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Avatar from './Avatar'
import { showSuccessToast, showErrorToast } from '../utils/Toastr';
import '../css/Account.css'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ username: '', avatar_url: '', year: '', field_of_study: '' })
  const [entries, setEntries] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { user } = session

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`username, avatar_url, year, field_of_study`)
          .eq('id', user.id)
          .single()
        if (profileError && profileError.code !== 'PGRST116') throw profileError

        setProfile({
          username: profileData?.username || '',
          avatar_url: profileData?.avatar_url || '',
          year: profileData?.year || '',
          field_of_study: profileData?.field_of_study || '',
        })

        // Fetch related entries
        const { data: entriesData, error: entriesError } = await supabase
          .from('entry')
          .select(`professor_name, course_id, quality, difficulty, comment`)
          .eq('user_id', user.id)
        if (entriesError) throw entriesError

        setEntries(entriesData || [])
      } catch (error) {
        console.warn(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  async function updateProfile(updates) {
    try {
      setLoading(true)
      const { user } = session

      const profileUpdates = {
        id: user.id,
        user_email: user.email,
        ...updates,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(profileUpdates)
      if (error) throw error

      // Refresh profile data...
    } catch (error) {
      if (error.message.includes("email_check")){
        showErrorToast('Only @case.edu email addresses are allowed. Please enter valid email');
      }else{
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }
  

  const { username, avatar_url, year, field_of_study } = profile

  const resendVerificationEmail = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        email: session.user.email,
      })
      if (error) throw error
      showSuccessToast('Verification email has been resent. Please check your inbox.')
    } catch (error) {
      console.error('Error resending verification email:', error)
      showErrorToast(error.error_description || error.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account-container">
      <div className="form-widget">
        <Avatar url={profile.avatar_url} size={100} onUpload={(url) => updateProfile({ avatar_url: url })} />
        <div className="profile-info">
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            placeholder="Username"
            className="input-field"
          />
          <input
            type="number"
            value={profile.year}
            onChange={(e) => setProfile({ ...profile, year: e.target.value })}
            placeholder="Year"
            className="input-field"
          />
          <input
            type="text"
            value={profile.field_of_study}
            onChange={(e) => setProfile({ ...profile, field_of_study: e.target.value })}
            placeholder="Field of Study"
            className="input-field"
          />
        </div>
        <button
          onClick={() => updateProfile({ username: profile.username, year: profile.year, field_of_study: profile.field_of_study })}
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
          entries.map((entry, index) => (
            <div key={index} className="entry-card">
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
