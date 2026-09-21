import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { LoginForm } from './components/LoginForm'
import { ProjectListPage } from './pages/ProjectListPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { EditProjectPage } from './pages/EditProjectPage'
import './App.css'

function App() {
  const { session, loading } = useAuth()

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path='/projects/:id/edit' element = {<EditProjectPage />} />
        {/* More routes coming soon */}
      </Routes>
    </BrowserRouter>
  )
}

export default App