import type { Goal, SavingsBehavior } from "../types";
import { subMonths, addMonths, formatISO } from "date-fns";

export const mockGoals: Goal[] = [
  // Case 1: On track — will reach in 4 months, target is 6 months away
  {
    id: "g1",
    title: "Emergency Fund",
    target_amount: 100_000,
    current_amount: 40_000,
    target_date: formatISO(addMonths(new Date(), 6)),
    created_at: formatISO(subMonths(new Date(), 3)),
    updated_at: formatISO(new Date()),
  },
  // Case 2: Behind schedule — needs 8 months but target is only 4 months away
  {
    id: "g2",
    title: "New Laptop",
    target_amount: 80_000,
    current_amount: 15_000,
    target_date: formatISO(addMonths(new Date(), 4)),
    created_at: formatISO(subMonths(new Date(), 1)),
    updated_at: formatISO(new Date()),
  },
  // Case 3: Ahead of schedule — needs 2 months but target is 6 months away
  {
    id: "g3",
    title: "Japan Trip 2026",
    target_amount: 150_000,
    current_amount: 120_000,
    target_date: formatISO(addMonths(new Date(), 6)),
    created_at: formatISO(subMonths(new Date(), 10)),
    updated_at: formatISO(new Date()),
  },
  // Case 4: Already achieved — current meets target
  {
    id: "g4",
    title: "New Phone",
    target_amount: 50_000,
    current_amount: 52_000,
    target_date: formatISO(addMonths(new Date(), 2)),
    created_at: formatISO(subMonths(new Date(), 4)),
    updated_at: formatISO(new Date()),
  },
  // Case 5: Zero savings rate — unreachable (tests 0 monthly_savings edge case)
  {
    id: "g5",
    title: "Dream House Down Payment",
    target_amount: 1_000_000,
    current_amount: 10_000,
    target_date: formatISO(addMonths(new Date(), 24)),
    created_at: formatISO(subMonths(new Date(), 1)),
    updated_at: formatISO(new Date()),
  },
];

export const mockBehavior: SavingsBehavior = {
  average_monthly_savings: 15_000,
  average_monthly_spending: 35_000,
};

// Zero-savings behavior for testing Case 5
export const mockBehaviorNoSavings: SavingsBehavior = {
  average_monthly_savings: 0,
  average_monthly_spending: 50_000,
};
