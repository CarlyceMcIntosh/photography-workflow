import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  created_at: string
  updated_at: string
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const token = session?.access_token || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchFromAPI(`/projects/${id}`, token),
    enabled: !!token && !!id,
  })
  const queryClient = useQueryClient()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const deleteMutation = useMutation({
    mutationFn: () =>
        fetchFromAPI(`/projects/${id}`, token, {
        method: 'DELETE',
        }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        navigate('/')
    },
    })

    const handleDelete = () => {
    deleteMutation.mutate()
    }

  const project: Project | undefined = data?.project

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to Projects
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {project.name}
              </h2>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {project.workflow_state}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/projects/${id}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Edit Project
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Session Location</h3>
              <p className="text-gray-900">
                {project.session_location || <em className="text-gray-400">Not set</em>}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Session Date</h3>
              <p className="text-gray-900">
                {project.session_date 
                  ? new Date(project.session_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : <em className="text-gray-400">Not scheduled</em>
                }
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Selection Limit</h3>
              <p className="text-gray-900">
                {project.selection_limit 
                  ? `${project.selection_limit} photos`
                  : <em className="text-gray-400">Not set</em>
                }
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Selection Deadline</h3>
              <p className="text-gray-900">
                {project.selection_deadline
                  ? new Date(project.selection_deadline).toLocaleDateString()
                  : <em className="text-gray-400">Not set</em>
                }
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-gray-600 text-sm">
                {new Date(project.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-600 text-sm">
                {new Date(project.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Project?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{project.name}"? This action cannot be undone.
              </p>
              {deleteMutation.error && (
                <div className="text-red-600 text-sm mb-4">
                  Error: {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete project'}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}