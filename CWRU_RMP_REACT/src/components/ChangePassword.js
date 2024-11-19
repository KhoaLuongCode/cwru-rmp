import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { showSuccessToast, showErrorToast } from '../utils/Toastr'
import { useNavigate } from 'react-router-dom' // Use useNavigate instead of useHistory

export default function CreatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate() // Replace history with navigate

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      const user = supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.auth.updateUser({
          password,
        })

        if (error) {
          throw error
        }

        showSuccessToast('Password has been updated successfully.')
        navigate('/account') // Use navigate to redirect to the account page
      }
    } catch (error) {
      showErrorToast(error.message || 'An error occurred while updating the password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-password-container">
      <h2>Create New Password</h2>
      <form onSubmit={handleSubmit} className="password-form">
        <div className="input-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            className="input-field"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
