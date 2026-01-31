import { Hono } from "hono";
import { cors } from "hono/cors";
import cashflow from "./routes/cashFlow.route";
import cashFlowAnalytics from "./routes/cashFlowAnalytics.route";
import { Env } from "./types/env";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/cashflows", cashflow);
app.route("/api/cashflows/analytics", cashFlowAnalytics);

export default app;
