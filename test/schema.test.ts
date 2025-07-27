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
