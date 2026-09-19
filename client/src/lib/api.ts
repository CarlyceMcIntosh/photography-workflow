//resuable helper funcrion that TanStack Query will use to send authenticated HTTP requests to the backend

export async function fetchFromAPI(
    endpoint: string,
    token: string,
    options?: RequestInit
  ) {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    })
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
  
    return response.json()
  }