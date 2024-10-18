// Home.js
import './index.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Account from './Account'
import Search from './Search'
import Submit from './Submit'
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
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <BrowserRouter>
        <header className="App-header">
          <nav>
            <ul>
              <li><Link to="/search">About</Link></li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/search" element={<Search />} />

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
