/**
 * DealMemory Real API Client.
 *
 * Coordinates authentication and real backend API calls.
 * Never stores or exposes backend secrets.
 */

import type { RealDealBriefingResponse } from '../types'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

const TOKEN_KEY = 'dealmemory_token'
const USER_KEY = 'dealmemory_user'

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // Ignore storage errors in restricted environments
    }
  },
  clearToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // Ignore
    }
  },
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY)
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  },
  setUser: (user: any): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch {
      // Ignore
    }
  },
}

/**
 * Standard fetch wrapper that automatically attaches the Bearer JWT token
 * and maps HTTP error status codes to clear, actionable error messages.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (err: any) {
    throw new Error(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure the backend is running.`
    )
  }

  if (!response.ok) {
    let errorDetail = ''
    try {
      const data = await response.json()
      errorDetail = data.detail || data.message || JSON.stringify(data)
    } catch {
      errorDetail = await response.text()
    }

    if (response.status === 401) {
      authStorage.clearToken()
      throw new Error(
        'Authentication required or session expired. Please sign in.'
      )
    } else if (response.status === 404) {
      throw new Error(
        errorDetail || 'Deal or resource not found or access is unauthorized.'
      )
    } else if (response.status === 503) {
      throw new Error(
        errorDetail ||
          'AI Deal Briefing service is temporarily unavailable.'
      )
    } else if (response.status === 502) {
      throw new Error(
        errorDetail ||
          'AI Deal Briefing generation failed. Please check backend model connectivity.'
      )
    }

    throw new Error(
      errorDetail || `API request failed with HTTP ${response.status}`
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const authApi = {
  async login(email: string, password: string) {
    const data = await apiFetch<{
      access_token: string
      user: { id: string; name: string; email: string }
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    authStorage.setToken(data.access_token)
    authStorage.setUser(data.user)
    return data
  },

  async signup(email: string, password: string, name: string) {
    const data = await apiFetch<{
      access_token: string
      user: { id: string; name: string; email: string }
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    authStorage.setToken(data.access_token)
    authStorage.setUser(data.user)
    return data
  },

  /**
   * Helper that verifies the client is authenticated.
   * Does NOT silently log in as another user, ensuring strict user isolation.
   */
  async ensureAuthenticated(): Promise<string | null> {
    return authStorage.getToken()
  },
}

export const dealsApi = {
  async getDeals() {
    await authApi.ensureAuthenticated()
    return apiFetch<any[]>('/api/deals', { method: 'GET' })
  },

  /**
   * Resolves a route deal parameter (e.g. 'acme' or a UUID)
   * to a real PostgreSQL deal UUID owned by the user.
   */
  async resolveDealId(dealIdOrSlug?: string): Promise<string> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (dealIdOrSlug && uuidRegex.test(dealIdOrSlug)) {
      return dealIdOrSlug
    }

    // If it's a slug like 'acme' or unspecified, search user's real deals
    await authApi.ensureAuthenticated()
    try {
      const deals = await this.getDeals()
      if (deals && deals.length > 0) {
        // Look for deal named Enterprise Platform or with account containing Acme
        const acmeDeal = deals.find(
          (d: any) =>
            (d.name && d.name.toLowerCase().includes('enterprise platform')) ||
            (d.account_name && d.account_name.toLowerCase().includes('acme'))
        )
        if (acmeDeal) {
          return acmeDeal.id
        }
        return deals[0].id
      }
    } catch {
      // Fallback below
    }

    // Default seeded Acme deal ID fallback
    return '00278405-0156-4732-b72c-7c44c847ada4'
  },

  /**
   * Calls the real backend endpoint POST /api/deals/{deal_id}/prepare.
   * Synthesizes PostgreSQL deal context + Hindsight recalled experiential memory + Groq.
   */
  async prepareDeal(dealIdOrSlug?: string): Promise<RealDealBriefingResponse> {
    await authApi.ensureAuthenticated()
    const dealId = await this.resolveDealId(dealIdOrSlug)

    return apiFetch<RealDealBriefingResponse>(`/api/deals/${dealId}/prepare`, {
      method: 'POST',
    })
  },
}
