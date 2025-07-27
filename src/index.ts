import { createClient } from '@supabase/supabase-js'
import { Hono } from 'hono'
import type { Env } from './context'
import { yoga } from './yoga'

const app = new Hono<{ Bindings: Env }>()

// Root path - serve landing page
app.get('/', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aipictors DB API</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 2rem; }
        .endpoint { background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px; }
        .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem; }
        .get { background: #28a745; color: white; }
        .post { background: #007bff; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 AiPictors Database API</h1>
        <p>GraphQL & REST API for AiPictors platform</p>
    </div>
    
    <h2>📚 Available Endpoints</h2>
    
    <div class="endpoint">
        <span class="method get">GET</span>
        <strong>/api/user_like_ranking</strong>
        <p>ユーザーいいねランキングを取得</p>
    </div>
    
    <div class="endpoint">
        <span class="method post">POST</span>
        <strong>/graphql</strong>
        <p>GraphQL API - クエリとミューテーション</p>
        <a href="/graphql" target="_blank">GraphQL Playground を開く</a>
    </div>
    
    <h2>🔗 Links</h2>
    <ul>
        <li><a href="https://github.com/aipictors/aipictors-db" target="_blank">GitHub Repository</a></li>
        <li><a href="https://aipictors.com" target="_blank">AiPictors Main Site</a></li>
    </ul>
</body>
</html>`)
})

// REST API: ユーザーいいねランキング取得
app.get('/api/user_like_ranking', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

  const { data, error } = await supabase
    .from('user_like_ranking')
    .select('*')
    .order('count', { ascending: false })
    .limit(10)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})

// GraphQL API: すべてのクエリとミューテーション
app.all('/graphql', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

  // GraphQL contextにsupabaseクライアントを注入
  const request = c.req.raw
  Object.defineProperty(request, 'context', {
    value: { supabase },
    writable: false,
  })

  const response = await yoga.handle(request)
  return response
})

export default app
