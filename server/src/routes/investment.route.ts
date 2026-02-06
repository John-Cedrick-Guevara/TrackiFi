import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Env } from "../types/env";
import * as investmentService from "../services/investment.service";
import {
  createInvestmentValidator,
  updateValueValidator,
  cashOutValidator,
} from "../validators/investment.validator";

const investmentRoute = new Hono<{ Bindings: Env }>();

// Create investment
investmentRoute.post(
  "/",
  zValidator("json", createInvestmentValidator),
  async (c) => {
    const body = await c.req.json();
    const token = c.req.header("Authorization")?.split(" ")[1];
    const { data, error } = await investmentService.createInvestment(
      body,
      c.env,
      token,
    );
    if (error) return c.json({ error }, 400);
    return c.json({ data });
  },
);

// Get all investments
investmentRoute.get("/", async (c) => {
  console.log(`[Route] GET /api/investments - ${c.req.method}`);
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    console.warn("[Auth] Missing token in getInvestments");
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const { data, error } = await investmentService.getInvestments(c.env, token);

  if (error) {
    console.error(`[Service] getInvestments error: ${error}`);
    return c.json({ error }, 400);
  }

  console.log(`[Route] Returning ${data?.length || 0} investments`);
  return c.json({ data });
});

// Get single investment with history
investmentRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const token = c.req.header("Authorization")?.split(" ")[1];
  const { data, error } = await investmentService.getInvestmentById(
    id,
    c.env,
    token,
  );
  if (error) return c.json({ error }, 404);
  return c.json({ data });
});

// Update investment value (history)
investmentRoute.post(
  "/:id/value",
  zValidator("json", updateValueValidator),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const token = c.req.header("Authorization")?.split(" ")[1];
    const { data, error } = await investmentService.updateInvestmentValue(
      id,
      body,
      c.env,
      token,
    );
    if (error) return c.json({ error }, 400);
    return c.json({ data });
  },
);

// Cash out investment
investmentRoute.post(
  "/:id/cashout",
  zValidator("json", cashOutValidator),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const token = c.req.header("Authorization")?.split(" ")[1];
    const { data, error } = await investmentService.cashOutInvestment(
      id,
      body,
      c.env,
      token,
    );
    if (error) return c.json({ error }, 400);
    return c.json({ data });
  },
);

// Delete investment
investmentRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const token = c.req.header("Authorization")?.split(" ")[1];
  const { error } = await investmentService.deleteInvestment(id, c.env, token);
  if (error) return c.json({ error }, 400);
  return c.json({ message: "Investment deleted successfully" });
});

export default investmentRoute;
