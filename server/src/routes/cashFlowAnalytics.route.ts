import { Hono } from "hono";
import {
  getTodayCashFlow,
  getRecentTransactions,
  getCashFlowTimeSeries,
  getCashFlowByCategory,
} from "../services/cashFlowAnalytics.service";
import { Env } from "../types/env";

const cashFlowAnalytics = new Hono<{ Bindings: Env }>();

/**
 * GET /today - Returns today's cash flow summary
 */
cashFlowAnalytics.get("/today", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const { data, error } = await getTodayCashFlow(c.env, token);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

/**
 * GET /recent - Returns recent transaction history
 */
cashFlowAnalytics.get("/recent", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const { data, error } = await getRecentTransactions(c.env, token);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

/**
 * GET /timeseries - Returns cash flow time series data
 * Query params: timeView (daily|weekly|monthly), startDate, endDate
 */
cashFlowAnalytics.get("/timeseries", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const timeView = c.req.query("timeView") as "daily" | "weekly" | "monthly";
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  // Validate required parameters
  if (!timeView || !startDate || !endDate) {
    return c.json(
      { error: "Missing required parameters: timeView, startDate, endDate" },
      400,
    );
  }

  // Validate timeView enum
  if (!["daily", "weekly", "monthly"].includes(timeView)) {
    return c.json(
      { error: "Invalid timeView. Must be: daily, weekly, or monthly" },
      400,
    );
  }

  const { data, error } = await getCashFlowTimeSeries(
    c.env,
    timeView,
    startDate,
    endDate,
    token,
  );

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

/**
 * GET /by-category - Returns cash flow breakdown by category
 * Query params: startDate, endDate, type (in|out)
 */
cashFlowAnalytics.get("/by-category", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const type = (c.req.query("type") as "in" | "out") || "out";

  console.log(type)

  // Validate required parameters
  if (!startDate || !endDate) {
    return c.json(
      { error: "Missing required parameters: startDate, endDate" },
      400,
    );
  }

  // Validate type
  if (type && !["in", "out"].includes(type)) {
    return c.json({ error: "Invalid type. Must be 'in' or 'out'" }, 400);
  }

  const { data, error } = await getCashFlowByCategory(
    c.env,
    startDate,
    endDate,
    token,
    type,
  );

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

export default cashFlowAnalytics;
