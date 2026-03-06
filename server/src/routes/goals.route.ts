import { Hono } from "hono";
import { generatePrediction } from "../services/goals.service";
import { Env } from "../types/env";

const goalsRoute = new Hono<{ Bindings: Env }>();

goalsRoute.get("/generate-prediction", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const goalId = c.req.query("goalId");
  const userId = c.req.query("userId");

  if (!goalId || !userId) {
    return c.json(
      { error: "Missing required parameters: goalId, userId" },
      400,
    );
  }

  const { prediction, monthsNeeded, estimatedCompletionDate, success } =
    await generatePrediction(c.env, token, goalId, userId);

  if (!success) {
    return c.json({ error: prediction }, 400);
  }

  return c.json({ prediction, monthsNeeded, estimatedCompletionDate });
});

export default goalsRoute;
