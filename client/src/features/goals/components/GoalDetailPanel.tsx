import type { Goal, SavingsBehavior, GoalForecast } from "../types";
import { calculateForecast } from "../utils/forecasting";
import { formatCurrency } from "../utils/format";
import { ForecastInsight } from "./ForecastInsight";
import { format, parseISO, subMonths } from "date-fns";
import { useAuth } from "../../auth/hooks/useAuth";
import { goalsAPI } from "../services/goalsService";
import { useSupabase } from "@/providers";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Calendar, Wallet, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GoalDetailPanelProps {
  goal: Goal | null;
  behavior: SavingsBehavior | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoalDetailPanel = ({
  goal,
  behavior,
  isOpen,
  onClose,
}: GoalDetailPanelProps) => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [prediction, setPrediction] = useState<{
    prediction: string;
    monthsNeeded?: number;
    estimatedCompletionDate?: string;
  } | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrediction() {
      if (isOpen && goal && user) {
        setPredictionLoading(true);
        setPredictionError(null);
        try {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          if (token) {
            const data = await goalsAPI.generatePrediction(
              goal.id,
              user.id,
              token,
            );
            setPrediction(data);
          }
        } catch (err: any) {
          setPredictionError(err.message || "Failed to load prediction");
        } finally {
          setPredictionLoading(false);
        }
      } else if (!isOpen) {
        setPrediction(null);
      }
    }
    fetchPrediction();
  }, [isOpen, goal, user, supabase]);

  if (!goal || !behavior) return null;

  // Use back-end forecast if available, otherwise fallback to frontend calculation
  const backendForecast: GoalForecast | null = prediction
    ? {
        months_to_goal: prediction.monthsNeeded ?? 0,
        is_on_track: true, // We could refine this logic if back-end returns more info
        forecast_message: prediction.prediction,
      }
    : null;

  const forecast = backendForecast || calculateForecast(goal, behavior);
  const percentage = Math.min(
    100,
    Math.max(0, (goal.current_amount / goal.target_amount) * 100),
  );
  const isCompleted = goal.current_amount >= goal.target_amount;
  const remaining = goal.target_amount - goal.current_amount;

  // Generate mock chart data simulating saving history over past 6 months
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const monthTarget = subMonths(new Date(), 5 - i);
    // Let's pretend user saved purely linearly (mock data logic)
    const baseProgress =
      goal.current_amount - behavior.average_monthly_savings * (5 - i);
    return {
      name: format(monthTarget, "MMM"),
      amount: Math.max(0, baseProgress),
    };
  });
  // Add the current month exact value
  chartData[5].amount = goal.current_amount;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-sm p-3">
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-sm text-primary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-primary" />
            {goal.title}
          </SheetTitle>
          <SheetDescription>
            Created on {format(parseISO(goal.created_at), "MMMM d, yyyy")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2 relative">
            <div className="flex justify-between items-end mb-1">
              <div>
                <p className="text-sm text-muted-foreground">Current Saved</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(goal.current_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Target Amount</p>
                <p className="text-xl font-medium">
                  {formatCurrency(goal.target_amount)}
                </p>
              </div>
            </div>

            <Progress value={percentage} className="h-4" />

            <div className="flex justify-between text-sm text-muted-foreground pt-1">
              <span>{percentage.toFixed(1)}% Complete</span>
              <span>{formatCurrency(remaining)} remaining</span>
            </div>
          </div>

          <div className="space-y-4">
            {predictionLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating advanced projection...
              </div>
            ) : predictionError ? (
              <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 dark:bg-destructive/20">
                Note: Advanced projection unavailable ({predictionError}). Using
                basic fallback.
              </div>
            ) : (
              prediction && (
                <div className="text-xs bg-primary/10 text-primary p-3 rounded-md border border-primary/20 dark:bg-primary/20">
                  <span className="font-bold">AI Insight:</span> Estimated
                  completion date: {prediction.estimatedCompletionDate}.
                </div>
              )
            )}

            <ForecastInsight forecast={forecast} isCompleted={isCompleted} />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border/50 rounded-xl p-4 bg-card shadow-sm text-card-foreground">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">Target Date</span>
              </div>
              <p className="font-semibold text-foreground">
                {format(parseISO(goal.target_date), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {forecast.months_to_goal > 0
                  ? `${forecast.months_to_goal} months to go`
                  : "Target reached"}
              </p>
            </div>

            <div className="border border-border/50 rounded-xl p-4 bg-card shadow-sm text-card-foreground">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">Av. Monthly Saving</span>
              </div>
              <p className="font-semibold text-foreground">
                {formatCurrency(behavior.average_monthly_savings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on recent behavior
              </p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="border border-border/50 bg-card rounded-xl p-4 pt-5 mt-6 shadow-sm text-card-foreground">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Savings History</h3>
            </div>
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAmount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted-foreground)/0.2)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    dy={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
