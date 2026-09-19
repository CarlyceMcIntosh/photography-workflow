// Login form for collecting user credentials and signing in through the shared AuthContext.
// Handles form state, loading feedback, and login errors.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../lib/AuthContext'

export function LoginForm() {
  // Get the shared signIn function from AuthContext
  const { signIn } = useAuth()
  // Store form input values and UI state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Runs when the login form is submitted
  const handleSubmit = async (e: FormEvent) => {
    // Prevent the browser from refreshing the page
    e.preventDefault()
    // Reset old errors and show loading state
    setError('')
    setLoading(true)

    try {
    // Attempt login using the AuthContext signIn function
      await signIn(email, password)
    } catch (err) {
      // Display the Supabase/login error if sign-in fails
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      // Stop loading whether login succeeds or fails
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Photography Workflow
        </h1>
        {/*When a user submits the form */}
        <form onSubmit={handleSubmit} className="space-y-4"> 
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            {/* Controlled input: React state stores the current email value */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            {/* Controlled input: React state stores the current password value */}
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">
              {/* Only show this message if an error exists */}
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {/* Give the user feedback while login is processing */}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}