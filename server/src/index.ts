import { Hono } from "hono";
import { cors } from "hono/cors";
import cashflow from "./routes/cashFlow.route";
import cashFlowAnalytics from "./routes/cashFlowAnalytics.route";
import investmentRoute from "./routes/investment.route";
import { Env } from "./types/env";

const app = new Hono<{ Bindings: Env }>();

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

app.route("/api/cashflows", cashflow);
app.route("/api/cashflows/analytics", cashFlowAnalytics);
app.route("/api/investments", investmentRoute);

export default app;
