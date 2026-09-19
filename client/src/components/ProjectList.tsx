import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../lib/AuthContext'
import { fetchFromAPI } from '../lib/api'

// Defines the shape/type of a project object returned by the backend
interface Project {
  id: string
  name: string
  session_date: string | null
  session_location: string | null
  workflow_state: string
  created_at: string
}

export function ProjectList() {
  // Get the current logged-in session from AuthContext
  const { session } = useAuth()

  // Pull the JWT access token from the session
  // Falls back to an empty string if there is no session/token
  const token = session?.access_token || ''

  // Fetch the user's projects from the backend
  // TanStack Query manages the data, loading state, error state, and caching
  const { data, isLoading, error } = useQuery({
    // Unique name/key TanStack Query uses to identify and cache this data
    queryKey: ['projects'],

    // Function that actually calls the backend API
    queryFn: () => fetchFromAPI('/projects', token),

    // Only run the query when an auth token exists
    enabled: !!token,
  })

  // Show a loading message while the request is still running
  if (isLoading) {
    return <div className="text-gray-600">Loading projects...</div>
  }

  // Show an error message if the request fails
  if (error) {
    return (
      <div className="text-red-600">
        Error loading projects:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  // Pull the projects array from the API response
  // If no projects data exists, use an empty array instead
  const projects: Project[] = data?.projects || []

  // Empty state for users who do not have any projects yet
  if (projects.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No projects yet. Create your first project below!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Loop through the projects and create one card for each project */}
      {projects.map((project) => (
        <div
          // React uses the unique project id to track each item in the list
          key={project.id}
          className="bg-white p-6 rounded-lg shadow border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {project.name}
          </h3>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {project.workflow_state}
              </span>
            </p>

            {/* Only show location if this project has one */}
            {project.session_location && (
              <p>
                <span className="font-medium">Location:</span>{' '}
                {project.session_location}
              </p>
            )}

            {/* Only show the session date if one exists */}
            {project.session_date && (
              <p>
                <span className="font-medium">Session:</span>{' '}
                {new Date(project.session_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}