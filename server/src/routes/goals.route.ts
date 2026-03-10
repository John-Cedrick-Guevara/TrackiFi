import { Hono } from "hono";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getContributions,
  addContribution,
  removeContribution,
  generatePrediction,
} from "../services/goals.service";
import {
  createGoalValidator,
  updateGoalValidator,
  createContributionValidator,
} from "../validators/goals.validator";
import { Env } from "../types/env";
import { TimeInterval } from "../types/goals.types";

const goalsRoute = new Hono<{ Bindings: Env }>();

// ==================
// GOAL CRUD
// ==================

// GET /api/goals — List all goals with progress
goalsRoute.get("/", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const { data, error } = await getGoals(c.env, token);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ data });
});

// GET /api/goals/:id — Single goal with progress
goalsRoute.get("/:id", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const { data, error } = await getGoalById(c.env, token, goalId);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ data });
});

// POST /api/goals — Create goal
goalsRoute.post("/", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const body = await c.req.json();
  const validation = createGoalValidator.safeParse(body);
  if (!validation.success) {
    return c.json({ error: validation.error.issues[0].message }, 400);
  }

  const { data, error } = await createGoal(c.env, token, validation.data);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ data }, 201);
});

// PUT /api/goals/:id — Update goal
goalsRoute.put("/:id", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const body = await c.req.json();
  const validation = updateGoalValidator.safeParse(body);
  if (!validation.success) {
    return c.json({ error: validation.error.issues[0].message }, 400);
  }

  const { data, error } = await updateGoal(
    c.env,
    token,
    goalId,
    validation.data,
  );
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ data });
});

// DELETE /api/goals/:id — Delete goal
goalsRoute.delete("/:id", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const { data, error } = await deleteGoal(c.env, token, goalId);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ success: true });
});

// ==================
// CONTRIBUTIONS
// ==================

// GET /api/goals/:id/contributions — List contributions for a goal
goalsRoute.get("/:id/contributions", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const { data, error } = await getContributions(c.env, token, goalId);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ data });
});

// POST /api/goals/:id/contributions — Add contribution
goalsRoute.post("/:id/contributions", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const body = await c.req.json();
  const validation = createContributionValidator.safeParse(body);
  if (!validation.success) {
    return c.json({ error: validation.error.issues[0].message }, 400);
  }

  const { data, error } = await addContribution(
    c.env,
    token,
    goalId,
    validation.data,
  );
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ data }, 201);
});

// DELETE /api/goals/:id/contributions/:contributionId — Remove contribution
goalsRoute.delete("/:id/contributions/:contributionId", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const contributionId = c.req.param("contributionId");
  const { data, error } = await removeContribution(
    c.env,
    token,
    goalId,
    contributionId,
  );
  if (error) return c.json({ error: error.message }, 400);

  return c.json({ success: true });
});

// ==================
// PREDICTION
// ==================

// GET /api/goals/:id/prediction — Generate prediction using contribution time-series
goalsRoute.get("/:id/prediction", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized: Missing token" }, 401);

  const goalId = c.req.param("id");
  const interval = (c.req.query("interval") || "monthly") as TimeInterval;

  if (!["daily", "weekly", "monthly"].includes(interval)) {
    return c.json(
      { error: "Invalid interval. Use: daily, weekly, or monthly" },
      400,
    );
  }

  const result = await generatePrediction(c.env, token, goalId, interval);

  if (!result.success) {
    return c.json(
      { error: result.prediction, timeSeries: result.timeSeries },
      400,
    );
  }

  return c.json({
    prediction: result.prediction,
    monthsNeeded: result.monthsNeeded,
    estimatedCompletionDate: result.estimatedCompletionDate,
    timeSeries: result.timeSeries,
  });
});

export default goalsRoute;
