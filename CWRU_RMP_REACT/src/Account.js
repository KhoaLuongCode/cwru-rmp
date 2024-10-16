import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [year, setYear] = useState(null)
  const [user_email, setEmail] = useState(null)
  const [field_of_study, setFieldOfStudy] = useState(null)

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)
        const { user } = session

        let { data, error } = await supabase
          .from('profiles')
          .select(`username, avatar_url, year, field_of_study, user_email`)
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
        setYear(data.year)
        setEmail(data.user_email)
        setFieldOfStudy(data.field_of_study)
      } catch (error) {
        console.warn(error.message)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [session])

  async function updateProfile({ username, avatar_url, year, field_of_study, user_email}) {
    try {
      setLoading(true)
      const { user } = session

      const updates = {
        id: user.id,
        username,
        avatar_url,
        year,
        field_of_study,
        user_email, 
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
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

  return (
    <div className="form-widget">
      <Avatar
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url)
          updateProfile({ username, avatar_url: url, year, field_of_study, user_email })
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
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="year">Year</label>
        <input
          id="year"
          type="year"
          value={year || ''}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="field_of_study">Field of Study</label>
        <input
          id="field_of_study"
          type="field_of_study"
          value={field_of_study || ''}
          onChange={(e) => setFieldOfStudy(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ username, avatar_url, year, field_of_study, user_email})}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
