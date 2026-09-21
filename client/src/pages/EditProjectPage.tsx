import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../lib/AuthContext'
import { fetchFromAPI } from '../lib/api'

interface Project {
  id: string
  name: string
  session_date: string | null
  session_location: string | null
  workflow_state: string
  selection_limit: number | null
  selection_deadline: string | null
}

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const token = session?.access_token || ''
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [sessionLocation, setSessionLocation] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [selectionLimit, setSelectionLimit] = useState('')
  const [selectionDeadline, setSelectionDeadline] = useState('')

  // Fetch existing project data
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchFromAPI(`/projects/${id}`, token),
    enabled: !!token && !!id,
  })

  const project: Project | undefined = data?.project

  // Pre-populate form when project loads
  useEffect(() => {
    if (project) {
      setName(project.name)
      setSessionLocation(project.session_location || '')
      setSessionDate(project.session_date ? project.session_date.split('T')[0] : '')
      setSelectionLimit(project.selection_limit?.toString() || '')
      setSelectionDeadline(project.selection_deadline ? project.selection_deadline.split('T')[0] : '')
    }
  }, [project])

  // Mutation for updating the project
  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, any>) =>
      fetchFromAPI(`/projects/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // Navigate back to detail page
      navigate(`/projects/${id}`)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const updates: Record<string, any> = {
      name,
    }

    if (sessionLocation) updates.session_location = sessionLocation
    if (sessionDate) updates.session_date = new Date(sessionDate).toISOString()
    if (selectionLimit) updates.selection_limit = parseInt(selectionLimit, 10)
    if (selectionDeadline) updates.selection_deadline = new Date(selectionDeadline).toISOString()

    updateMutation.mutate(updates)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Photography Workflow
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-600">
            Error: {error instanceof Error ? error.message : 'Project not found'}
          </div>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Projects
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={`/projects/${id}`} className="text-blue-600 hover:underline">
            ← Back to Project
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Session Location
              </label>
              <input
                id="location"
                type="text"
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700 mb-1">
                Session Date
              </label>
              <input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="selectionLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Selection Limit
              </label>
              <input
                id="selectionLimit"
                type="number"
                min="1"
                value={selectionLimit}
                onChange={(e) => setSelectionLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of photos client can select"
              />
            </div>

            <div>
              <label htmlFor="selectionDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                Selection Deadline
              </label>
              <input
                id="selectionDeadline"
                type="date"
                value={selectionDeadline}
                onChange={(e) => setSelectionDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {updateMutation.error && (
              <div className="text-red-600 text-sm">
                Error: {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update project'}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                to={`/projects/${id}`}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 inline-block"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}