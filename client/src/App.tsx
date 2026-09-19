import { useAuth } from './lib/AuthContext'
import { LoginForm } from './components/LoginForm'
import { ProjectList } from './components/ProjectList'
import { CreateProjectForm } from './components/CreateProjectForm'

import './App.css'

function App() {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Photography Workflow
          </h1>
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h2>
          <p className="text-gray-600">
            Logged in as: {session.user.email}
          </p>
        </div>

        <div className="mb-6">
          <CreateProjectForm />
        </div>

        <ProjectList />
      </main>
    </div>
  )
}

export default App