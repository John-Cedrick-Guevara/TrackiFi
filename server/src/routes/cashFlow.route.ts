import { Hono } from "hono";
import { createQuickEntry } from "../services/cashFlow.service";
import { zValidator } from "@hono/zod-validator";
import { quickEntryValidator } from "../validators/cashFlow.validator";
import { Env } from "../types/env";

const cashflow = new Hono<{ Bindings: Env }>();

cashflow.post(
  "/quick-entry",
  zValidator("json", quickEntryValidator),
  async (c) => {
    const body = await c.req.json();
    const token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const error = await createQuickEntry(body, c.env, token);
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ message: "Quick entry created successfully" });
  },
);

export default cashflow;
