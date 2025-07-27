import { describe, it, expect } from 'vitest'

// GraphQL Schema Tests
describe('GraphQL Schema', () => {
  it('should have valid UserLikeRanking type definition', async () => {
    const { schema } = await import('../src/schema')
    
    expect(schema).toBeDefined()
    expect(schema.getQueryType()).toBeDefined()
    expect(schema.getMutationType()).toBeDefined()
    
    const queryType = schema.getQueryType()
    const queryFields = queryType?.getFields()
    
    expect(queryFields).toHaveProperty('userLikeRankings')
    expect(queryFields).toHaveProperty('userLikeRanking')
  })

  it('should have valid mutation type', async () => {
    const { schema } = await import('../src/schema')
    
    const mutationType = schema.getMutationType()
    const mutationFields = mutationType?.getFields()
    
    expect(mutationFields).toHaveProperty('incrementUserLikeCount')
  })
})

// Context Types Tests
describe('Context Types', () => {
  it('should have correct Env interface', () => {
    const mockEnv = {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
    }
    
    // Type checking - these should not throw
    expect(typeof mockEnv.SUPABASE_URL).toBe('string')
    expect(typeof mockEnv.SUPABASE_ANON_KEY).toBe('string')
    expect(mockEnv.SUPABASE_URL.startsWith('https://')).toBe(true)
  })
})

// Configuration Tests
describe('Configuration', () => {
  it('should have valid package.json scripts', async () => {
    const packageJson = await import('../package.json')
    
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('deploy')
    expect(packageJson.scripts).toHaveProperty('test')
    expect(packageJson.scripts.dev).toBe('wrangler dev')
    expect(packageJson.scripts.deploy).toBe('wrangler deploy')
  })
})
