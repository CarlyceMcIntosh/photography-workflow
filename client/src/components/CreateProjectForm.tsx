import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../lib/AuthContext'
import { fetchFromAPI } from '../lib/api'

export function CreateProjectForm() {
  // Get the current Supabase session so we can send the user's auth token
  const { session } = useAuth()
  const token = session?.access_token || ''

  // Gives access to the shared TanStack Query client/cache
  const queryClient = useQueryClient()

  // Local form/UI state
  const [name, setName] = useState('')
  const [sessionLocation, setSessionLocation] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Mutation used to create a new project on the backend
  const createMutation = useMutation({
    mutationFn: (projectData: { name: string; session_location?: string }) =>
      fetchFromAPI('/projects', token, {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),

    onSuccess: () => {
      // Mark the cached project list as outdated so it refetches
      queryClient.invalidateQueries({ queryKey: ['projects'] })

      // Reset and close the form after a successful create
      setName('')
      setSessionLocation('')
      setShowForm(false)
    },
  })

  // Runs when the user submits the form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Start the POST mutation with the current form values
    createMutation.mutate({
      name,
      session_location: sessionLocation || undefined,
    })
  }

  // Before the form is opened, only show the create button
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        + Create New Project
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create New Project
      </h3>
      
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Project Name *
          </label>

          {/* Controlled input: name value is stored in React state */}
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Smith Family Portrait Session"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Session Location (optional)
          </label>

          {/* Optional controlled input for the session location */}
          <input
            id="location"
            type="text"
            value={sessionLocation}
            onChange={(e) => setSessionLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Central Park"
          />
        </div>

        {/* Show mutation error only if the create request fails */}
        {createMutation.error && (
          <div className="text-red-600 text-sm">
            Error:{' '}
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Failed to create project'}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            // Prevent duplicate submissions while the request is running
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {/* Show request progress to the user */}
            {createMutation.isPending ? 'Creating...' : 'Create Project'}
          </button>

          <button
            type="button"
            // Close the form without submitting it
            onClick={() => setShowForm(false)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}