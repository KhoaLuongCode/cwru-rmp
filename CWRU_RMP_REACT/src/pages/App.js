// Home.js
import '../css/App.css'
import logo from '../assets/logo.avif'
import 'react-toastify/dist/ReactToastify.css'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Auth from '../auth/Auth'
import Account from '../components/Account'
import Search from '../components/Search'
import Submit from '../components/Submit'
import CoursePage from '../components/CoursePage';
import ProfessorPage from '../components/ProfessorPage'; 
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '../utils/Toastr';

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
          <img src={logo} alt="logo" className="header-logo" />
          <nav>
            <ul>
              <li ><Link to="/search" style={{ color: 'white', fontWeight: 'bold' }}>Search</Link></li>
              {session && session.user.email_confirmed_at && (
                <li><Link to="/submit" style={{ color: 'white', fontWeight: 'bold' }}>Submit Feedback</Link></li>
              )}
              <li><Link to="/auth" style={{ color: 'white', fontWeight: 'bold' }}>
              {session && session.user.email_confirmed_at ? 'Profile' : 'Login'}
              </Link></li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/search" element={<Search />} />
          <Route path="/" element={<Search />} />

          <Route path="/course/:courseId" element={
              session && session.user.email_confirmed_at ? 
              <CoursePage session={session} /> : 
              <Navigate to="/auth" />
            } />
          <Route path="/professor/:professorId" element={
              session && session.user.email_confirmed_at ? 
              <ProfessorPage session={session} /> : 
              <Navigate to="/auth" />
            } />

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
                    onClick={async () => {
                      const { error } = await supabase.auth.signOut();
                      if (error) {
                        console.error('Error signing out:', error);
                        showErrorToast('Failed to sign out');
                      } else {
                        showSuccessToast('Signed out successfully');
                      }
                    }}

                  >
                    Sign Out
                  </button>
                </div>
              }
            />
          )}
        </Routes>


            </BrowserRouter>
            <ToastContainer />
      </div>
    </div>
  )
}
