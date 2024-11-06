// Home.js
import '../css/App.css'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Auth from '../auth/Auth'
import Account from '../components/Account'
import Search from '../components/Search'
import Submit from '../components/Submit'
import CoursePage from '../components/CoursePage';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="container">
      <BrowserRouter>
        <header className="App-header">
          <nav>
            <ul>
              <li>Home</li>
              <li ><Link to="/search" style={{ color: 'white' }}>Search</Link></li>
              {session && session.user.email_confirmed_at && (
                <li><Link to="/submit" style={{ color: 'white' }}>Submit Feedback</Link></li>
              )}
              <li><Link to="/auth" style={{ color: 'white' }}>
              {session && session.user.email_confirmed_at ? 'Profile' : 'Login'}
              </Link></li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/search" element={<Search />} />
          <Route path="/course/:courseId" element={<CoursePage />} />

          <Route 
            path="/submit" 
            element={
              session && session.user.email_confirmed_at ? 
                <Submit session={session} /> : 
                <Navigate to="/auth" />
            } 
          />

          {!session ? (
            <Route path="/auth" element={<Auth />} />
          ) : session.user.email_confirmed_at ? (
            <Route path="/auth" element={<Account key={session.user.id} session={session} />} />
          ) : (
            <Route 
              path="/auth" 
              element={
                <div>
                  <p>Please verify your email to access your account.</p>
                  <button
                    className="button block"
                    onClick={() => supabase.auth.signOut()}
                  >
                    Sign Out
                  </button>
                </div>
              }
            />
          )}
        </Routes>


            </BrowserRouter>
      </div>
    </div>
  )
}
