import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Env } from "../types/env";
import {
  createIncome,
  createExpense,
  createTransfer,
  getTransactionHistory,
} from "../services/transaction.service";
import {
  createIncomeValidator,
  createExpenseValidator,
  createTransferValidator,
  transactionFiltersValidator,
} from "../validators/transaction.validator";

const transactionRoutes = new Hono<{ Bindings: Env }>({
  strict: false,
});

/**
 * POST /transactions/income
 * Create an income transaction
 */
transactionRoutes.post(
  "/income",
  zValidator("json", createIncomeValidator),
  async (c) => {
    const token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const body = await c.req.json();
    const result = await createIncome(body, c.env, token);

    if (result.error) {
      return c.json({ error: result.error.message }, 500);
    }

    return c.json({
      data: result.data,
      message: "Income created successfully",
    });
  },
);

/**
 * POST /transactions/expense
 * Create an expense transaction
 */
transactionRoutes.post(
  "/expense",
  zValidator("json", createExpenseValidator),
  async (c) => {
    const token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const body = await c.req.json();
    const result = await createExpense(body, c.env, token);

    if (result.error) {
      return c.json({ error: result.error.message }, 500);
    }

    return c.json({
      data: result.data,
      message: "Expense created successfully",
    });
  },
);

/**
 * POST /transactions/transfer
 * Create a transfer transaction
 */
transactionRoutes.post(
  "/transfer",
  zValidator("json", createTransferValidator),
  async (c) => {
    const token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const body = await c.req.json();
    const result = await createTransfer(body, c.env, token);

    if (result.error) {
      return c.json({ error: result.error.message }, 500);
    }

    return c.json({
      data: result.data,
      message: "Transfer created successfully",
    });
  },
);

/**
 * GET /transactions
 * Get transaction history with optional filters
 */
transactionRoutes.get("/", async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  // Parse query parameters
  const filters = {
    transaction_type: c.req.query("transaction_type") as any,
    account_id: c.req.query("account_id"),
    start_date: c.req.query("start_date"),
    end_date: c.req.query("end_date"),
    limit: c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined,
    offset: c.req.query("offset")
      ? parseInt(c.req.query("offset")!)
      : undefined,
  };

  const result = await getTransactionHistory(filters, c.env, token);

  if (result.error) {
    return c.json({ error: result.error.message }, 500);
  }

  return c.json({ data: result.data });
});

export default transactionRoutes;
