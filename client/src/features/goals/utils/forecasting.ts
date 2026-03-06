import type { Goal, SavingsBehavior, GoalForecast } from "../types";

export const calculateForecast = (
  goal: Goal,
  behavior: SavingsBehavior,
): GoalForecast => {
  const remaining = goal.target_amount - goal.current_amount;

  if (remaining <= 0) {
    return {
      months_to_goal: 0,
      is_on_track: true,
      forecast_message: "Goal already achieved.",
    };
  }

  const monthly = behavior.average_monthly_savings || 0;

  if (monthly <= 0) {
    return {
      months_to_goal: Infinity,
      is_on_track: false,
      forecast_message:
        "No monthly savings detected — add income transactions so we can forecast your progress.",
    };
  }

  const months_to_goal = Math.ceil(remaining / monthly);

  let monthsUntilTarget = Infinity;
  try {
    const now = new Date();
    const target = new Date(goal.target_date);
    const diff =
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth());
    monthsUntilTarget = Math.max(0, diff);
  } catch {
    monthsUntilTarget = Infinity;
  }

  const is_on_track = months_to_goal <= monthsUntilTarget;
  const monthLabel = months_to_goal === 1 ? "month" : "months";

  let forecast_message: string;
  if (is_on_track && months_to_goal < monthsUntilTarget) {
    forecast_message = `You are ahead of schedule! At your current pace, you will reach this goal in ${months_to_goal} ${monthLabel}.`;
  } else if (is_on_track) {
    forecast_message = `At your current pace, you will reach this goal in ${months_to_goal} ${monthLabel}.`;
  } else {
    forecast_message = `At your current pace, you will reach this goal in ~${months_to_goal} ${monthLabel} — behind your target date.`;
  }

  return {
    months_to_goal,
    is_on_track,
    forecast_message,
  };
};

export default calculateForecast;
