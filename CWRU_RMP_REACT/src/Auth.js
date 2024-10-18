// Auth.js
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false) // Toggle between sign-up and sign-in

  const handleSignUp = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_email: email, 
          },
        },
      })      

      if (error) throw error
      console.log('Sign up successful:', data)
      alert('Check your email for the verification link!')
    } catch (error) {
      console.error('Error during sign up:', error)
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (!data.session?.user?.email_confirmed_at) {
        alert('Please verify your email before logging in.')
        supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Error during sign in:', error)
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignUp) {
      await handleSignUp(email, password)
    } else {
      await handleSignIn(email, password)
    }
  }

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">CWRU Rate My Professor</h1>
        <p className="description">
          {isSignUp
            ? 'Create an account with your email and password'
            : 'Sign in with your email and password'}
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              className="inputField"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className={'button block'}
              disabled={loading}
            >
              {loading
                ? 'Loading...'
                : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
            </button>
          </div>
        </form>
        <div style={{ marginTop: '10px' }}>
          <button
            className="button block"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
