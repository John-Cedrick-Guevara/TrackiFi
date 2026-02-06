import { Hono } from "hono";
import { cors } from "hono/cors";
import cashflow from "./routes/cashFlow.route";
import cashFlowAnalytics from "./routes/cashFlowAnalytics.route";
import investmentRoute from "./routes/investment.route";
import { Env } from "./types/env";

// Configure Hono with strict:false to handle both /path and /path/ variants
// This is critical for Cloudflare Workers production deployment
const app = new Hono<{ Bindings: Env }>({
  strict: false,  // Handle trailing slash variations
});

app.use("/*", cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: false,
}));

app.onError((err, c) => {
  console.error(`[Server Error] ${err.message}`);
  return c.json(
    {
      error: err.message,
      stack: c.env.SUPABASE_URL ? undefined : err.stack, // Hide stack in semi-prod if you want, but good for debugging now
    },
    500,
  );
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Health check and configuration diagnostic endpoint
app.get("/api/health", (c) => {
  const hasSupabaseUrl = !!c.env?.SUPABASE_URL;
  const hasAnonKey = !!c.env?.SUPABASE_ANON_KEY;
  const hasServiceKey = !!c.env?.SUPABASE_SERVICE_ROLE_KEY;
  
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    config: {
      supabaseUrl: hasSupabaseUrl ? c.env.SUPABASE_URL : "MISSING",
      hasAnonKey,
      hasServiceKey,
      usingKey: hasAnonKey ? "ANON_KEY" : hasServiceKey ? "SERVICE_ROLE_KEY" : "NONE",
      warning: hasServiceKey && hasAnonKey ? "Both keys present - will use ANON_KEY" : null,
    },
  });
});

// Mount routes - order matters for nested routes
app.route("/api/cashflows/analytics", cashFlowAnalytics);  // More specific first
app.route("/api/cashflows", cashflow);
app.route("/api/investments", investmentRoute);

// Catch-all 404 handler for debugging
app.notFound((c) => {
  console.error(`[404] Route not found: ${c.req.method} ${c.req.url}`);
  return c.json({ error: "Not Found", path: c.req.url, method: c.req.method }, 404);
});

export default app;
