import { makeExecutableSchema } from '@graphql-tools/schema'
import type { YogaContext } from './context'

// GraphQL Type Definitions
const typeDefs = `
  type UserLikeRanking {
    id: ID!
    user_id: String!
    count: Int!
    created_at: String!
    updated_at: String!
  }

  type Query {
    """
    ユーザーのいいねランキングを取得します
    """
    userLikeRankings(limit: Int = 10): [UserLikeRanking!]!

    """
    特定のユーザーのいいね情報を取得します
    """
    userLikeRanking(id: ID!): UserLikeRanking
  }

  type Mutation {
    """
    ユーザーのいいね数をインクリメントします
    """
    incrementUserLikeCount(user_id: String!): UserLikeRanking!
  }
`

// GraphQL Resolvers
const resolvers = {
  Query: {
    userLikeRankings: async (
      _parent: any,
      args: { limit?: number },
      context: YogaContext
    ) => {
      const { data, error } = await context.supabase
        .from('user_like_ranking')
        .select('*')
        .order('count', { ascending: false })
        .limit(args.limit || 10)

      if (error) {
        throw new Error(`Failed to fetch user like rankings: ${error.message}`)
      }

      return data || []
    },

    userLikeRanking: async (
      _parent: any,
      args: { id: string },
      context: YogaContext
    ) => {
      const { data, error } = await context.supabase
        .from('user_like_ranking')
        .select('*')
        .eq('id', args.id)
        .single()

      if (error) {
        throw new Error(`Failed to fetch user like ranking: ${error.message}`)
      }

      return data
    },
  },

  Mutation: {
    incrementUserLikeCount: async (
      _parent: any,
      args: { user_id: string },
      context: YogaContext
    ) => {
      // 既存のレコードを取得
      const { data: existingData } = await context.supabase
        .from('user_like_ranking')
        .select('*')
        .eq('user_id', args.user_id)
        .single()

      if (existingData) {
        // 既存レコードのカウントをインクリメント
        const currentCount =
          typeof existingData.count === 'number' ? existingData.count : 0
        const { data, error } = await context.supabase
          .from('user_like_ranking')
          .update({ count: currentCount + 1 })
          .eq('user_id', args.user_id)
          .select()
          .single()

        if (error) {
          throw new Error(
            `Failed to increment user like count: ${error.message}`
          )
        }

        return data
      } else {
        // 新しいレコードを作成
        const { data, error } = await context.supabase
          .from('user_like_ranking')
          .insert({ user_id: args.user_id, count: 1 })
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create user like count: ${error.message}`)
        }

        return data
      }
    },
  },
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
