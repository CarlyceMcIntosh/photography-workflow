// Centralizes frontend authentication by tracking the current Supabase session
// and providing shared sign-in/sign-out functionality to the rest of the app.


//necessary imports: React tools, supabase session type, and the supabase client
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

//defines what your auth-related data/functions the context will provide
interface AuthContextType {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

//creates the shared auth context for the app
const AuthContext = createContext<AuthContextType | undefined>(undefined)

//wrapper component for managing the auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [session, setSession] = useState<Session | null>(null)//stores current logged in session
  const [loading, setLoading] = useState(true) // tracks whether Supabase is still checking ofor an existing session

  useEffect(() => {
    // Checks if the user already has an active session when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes and keeps session state updated whenever login/logout happens
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    //stop listening for auth changes when this provider unmounts
    return () => subscription.unsubscribe()
  }, [])
  //log user in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }
  //log current user out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  // Makes auth state/functions available to everything inside this provider
  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for easily accessing auth context in components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}