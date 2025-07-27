import { createYoga } from 'graphql-yoga'
import { schema } from './schema'

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: ({ request }) => {
    // リクエストからコンテキストを取得
    return (request as any).context || {}
  },
  cors: {
    origin: '*',
    credentials: true,
  },
  graphiql: true,
})
