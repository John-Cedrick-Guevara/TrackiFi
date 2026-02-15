import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Env } from "../types/env";
import {
  getUserAccounts,
  getAccountBalance,
  getAccountById,
} from "../services/account.service";
import { accountIdValidator } from "../validators/account.validator";

const accountRoutes = new Hono<{ Bindings: Env }>({
  strict: false,
});

/**
 * GET /accounts
 * Get all accounts for the authenticated user with balances
 */
accountRoutes.get("/", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const result = await getUserAccounts(c.env, token);

  if (result.error) {
    return c.json({ error: result.error.message }, 500);
  }

  return c.json({ data: result.data });
});

/**
 * GET /accounts/:id
 * Get a specific account by ID
 */
accountRoutes.get("/:id", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  const accountId = c.req.param("id");

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const result = await getAccountById(accountId, c.env, token);

  if (result.error) {
    return c.json({ error: result.error.message }, 500);
  }

  return c.json({ data: result.data });
});

/**
 * GET /accounts/:id/balance
 * Get balance for a specific account
 */
accountRoutes.get("/:id/balance", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  const accountId = c.req.param("id");

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const result = await getAccountBalance(accountId, c.env, token);

  if (result.error) {
    return c.json({ error: result.error.message }, 500);
  }

  return c.json({ data: { balance: result.data } });
});

export default accountRoutes;
