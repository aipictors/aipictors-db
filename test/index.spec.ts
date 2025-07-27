import { describe, it, expect, vi, beforeEach } from 'vitest'
import worker from '../src'
import type { Env } from '../src/context'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
}

// Mock createClient function
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('AiPictors Database API', () => {
  const mockEnv: Env = {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  }

  const createMockContext = () => ({
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('REST API', () => {
    it('GET /api/user_like_ranking - should return user like rankings', async () => {
      // Mock successful Supabase response
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  id: '1',
                  user_id: 'user123',
                  count: 150,
                  created_at: '2025-01-01T00:00:00Z',
                  updated_at: '2025-01-15T10:30:00Z',
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      const request = new Request('http://localhost:8787/api/user_like_ranking')
      const ctx = createMockContext()
      const response = await worker.fetch(request, mockEnv, ctx as any)

      expect(response.status).toBe(200)
      const data = await response.json() as any
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('GET /api/user_like_ranking - should handle Supabase errors', async () => {
      // Mock Supabase error
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      })

      const request = new Request('http://localhost:8787/api/user_like_ranking')
      const ctx = createMockContext()
      const response = await worker.fetch(request, mockEnv, ctx as any)

      expect(response.status).toBe(500)
      const data = await response.json() as any
      expect(data).toHaveProperty('error')
    })
  })

  describe('GraphQL API', () => {
    it('POST /graphql - should handle GraphQL queries', async () => {
      // Mock successful Supabase response for GraphQL
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  id: '1',
                  user_id: 'user123',
                  count: 150,
                  created_at: '2025-01-01T00:00:00Z',
                  updated_at: '2025-01-15T10:30:00Z',
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      const query = `
        query {
          userLikeRankings(limit: 5) {
            id
            user_id
            count
          }
        }
      `

      const request = new Request('http://localhost:8787/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const ctx = createMockContext()
      const response = await worker.fetch(request, mockEnv, ctx as any)

      expect(response.status).toBe(200)
      const data = await response.json() as any
      expect(data).toHaveProperty('data')
    })

    it('GET /graphql - should serve GraphQL playground', async () => {
      const request = new Request('http://localhost:8787/graphql', {
        method: 'GET',
        headers: {
          Accept: 'text/html',
        },
      })

      const ctx = createMockContext()
      const response = await worker.fetch(request, mockEnv, ctx as any)

      expect(response.status).toBe(200)
      const contentType = response.headers.get('content-type')
      expect(contentType).toContain('text/html')
    })
  })

  describe('Static Files', () => {
    it('GET / - should serve the landing page', async () => {
      const request = new Request('http://localhost:8787/')
      const ctx = createMockContext()
      const response = await worker.fetch(request, mockEnv, ctx as any)

      expect(response.status).toBe(200)
      const contentType = response.headers.get('content-type')
      expect(contentType).toContain('text/html')
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const request = new Request('http://localhost:8787/unknown-route')
      const ctx = createMockContext()
      const response = await worker.fetch(request, mockEnv, ctx as any)

      expect(response.status).toBe(404)
    })
  })
})
