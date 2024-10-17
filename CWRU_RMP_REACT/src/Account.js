// Account.js
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    year: '',
    field_of_study: '',
  })

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)
        const { user } = session

        let { data, error } = await supabase
          .from('profiles')
          .select(`username, avatar_url, year, field_of_study`)
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
          throw error
        }

        if (data) {
          setProfile({
            username: data.username || '',
            avatar_url: data.avatar_url || '',
            year: data.year || '',
            field_of_study: data.field_of_study || '',
          })
        }
      } catch (error) {
        console.warn(error.message)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [session])

  async function updateProfile(updates) {
    try {
      setLoading(true)
      const { user } = session
  
      const profileUpdates = {
        id: user.id,
        user_email: user.email, // Include the user_email field
        ...updates,
        updated_at: new Date(),
      }
  
      let { error } = await supabase.from('profiles').upsert(profileUpdates)
  
      if (error) {
        throw error
      }
  
      // Refresh profile data...
    } catch (error) {
      if (error.message.includes("email_check")){
        alert('Only @case.edu email addresses are allowed. Please enter valid email')
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
      alert('Verification email has been resent. Please check your inbox.')
    } catch (error) {
      console.error('Error resending verification email:', error)
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          updateProfile({ avatar_url: url })
        }}
      />
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={user_email || ''}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="year">Year</label>
        <input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setProfile({ ...profile, year: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="field_of_study">Field of Study</label>
        <input
          id="field_of_study"
          type="text"
          value={field_of_study}
          onChange={(e) =>
            setProfile({ ...profile, field_of_study: e.target.value })
          }
        />
      </div>

      <div>
        <button
          className="button block primary"
          onClick={() =>
            updateProfile({ username, avatar_url, year, field_of_study })
          }
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      {!session.user.email_confirmed_at && (
        <div>
          <button
            className="button block"
            onClick={resendVerificationEmail}
            disabled={loading}
          >
            Resend Verification Email
          </button>
        </div>
      )}

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
