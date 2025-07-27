import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { yoga } from "./yoga";
import type { Env } from "./context";

const app = new Hono<{ Bindings: Env }>();

// REST API: ユーザーいいねランキング取得
app.get("/api/user_like_ranking", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from("user_like_ranking")
    .select("*")
    .order("count", { ascending: false })
    .limit(10);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

// GraphQL API: すべてのクエリとミューテーション
app.all("/graphql", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  // GraphQL contextにsupabaseクライアントを注入
  const request = c.req.raw;
  Object.defineProperty(request, "context", {
    value: { supabase },
    writable: false,
  });

  const response = await yoga.handle(request);
  return response;
});

export default app;
