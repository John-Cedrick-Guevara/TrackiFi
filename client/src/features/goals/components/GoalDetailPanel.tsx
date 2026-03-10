import type {
  Goal,
  SavingsBehavior,
  GoalForecast,
  GoalContribution,
} from "../types";
import { calculateForecast } from "../utils/forecasting";
import { formatCurrency } from "../utils/format";
import { ForecastInsight } from "./ForecastInsight";
import { format, parseISO } from "date-fns";
import {
  useGoalContributions,
  useGoalPrediction,
  useAddContribution,
  useRemoveContribution,
} from "../hooks/useGoals";
import { useTransactionHistory } from "@/features/savings/api";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Target,
  TrendingUp,
  Calendar,
  Wallet,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
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
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");

  const { data: contributions, isLoading: contributionsLoading } =
    useGoalContributions(goal?.id || "");

  const {
    data: prediction,
    isLoading: predictionLoading,
    error: predictionError,
  } = useGoalPrediction(goal?.id || "");

  // Fetch transactions for the source account to allow contribution selection
  const { data: transactions } = useTransactionHistory(
    goal?.source_account_id
      ? { account_id: goal.source_account_id, limit: 50 }
      : undefined,
  );

  const addContributionMutation = useAddContribution();
  const removeContributionMutation = useRemoveContribution();

  if (!goal || !behavior) return null;

  // Use back-end forecast if available, otherwise fallback to frontend calculation
  const backendForecast: GoalForecast | null = prediction
    ? {
        months_to_goal: prediction.monthsNeeded ?? 0,
        is_on_track: true,
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

  // Build chart data from real contribution time-series or prediction data
  const chartData =
    prediction?.timeSeries?.map((point) => ({
      name: point.period,
      amount: point.amount,
    })) || [];

  const handleAddContribution = () => {
    if (!selectedTransactionId || !contributionAmount || !goal) return;

    addContributionMutation.mutate(
      {
        goalId: goal.id,
        payload: {
          transaction_id: selectedTransactionId,
          amount: Number(contributionAmount),
        },
      },
      {
        onSuccess: () => {
          setShowAddContribution(false);
          setSelectedTransactionId("");
          setContributionAmount("");
        },
      },
    );
  };

  const handleRemoveContribution = (contributionId: string) => {
    if (!goal) return;
    removeContributionMutation.mutate({
      goalId: goal.id,
      contributionId,
    });
  };

  // Filter out transactions already contributed to this goal
  const contributedTxIds = new Set(
    (contributions || []).map((c: GoalContribution) => c.transaction_id),
  );
  const availableTransactions = (transactions || []).filter(
    (tx: any) => !contributedTxIds.has(tx.id),
  );

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
                Note: Advanced projection unavailable. Using basic fallback.
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
                <span className="text-sm font-medium text-foreground">
                  Target Date
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {goal.target_date
                  ? format(parseISO(goal.target_date), "MMM d, yyyy")
                  : "No target date"}
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
                <span className="text-sm font-medium text-foreground">
                  Contributions
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {contributions?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total allocations toward this goal
              </p>
            </div>
          </div>

          {/* Contribution Time Series Chart */}
          {chartData.length > 0 && (
            <div className="border border-border/50 bg-card rounded-xl p-4 pt-5 mt-6 shadow-sm text-card-foreground">
              <div className="flex items-center gap-2 mb-4 text-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Contribution History
                </h3>
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
          )}

          {/* Contributions List */}
          <div className="border border-border/50 bg-card rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Contributions</h3>
              {!isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddContribution(!showAddContribution)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {/* Add Contribution Form */}
            {showAddContribution && (
              <div className="mb-4 p-3 border rounded-md bg-muted/30 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Select Transaction
                  </label>
                  <select
                    value={selectedTransactionId}
                    onChange={(e) => setSelectedTransactionId(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md bg-background text-foreground text-sm"
                  >
                    <option value="">Choose a transaction...</option>
                    {availableTransactions.map((tx: any) => (
                      <option key={tx.id} value={tx.id}>
                        {formatCurrency(Number(tx.amount))} —{" "}
                        {tx.description || tx.transaction_type} (
                        {format(new Date(tx.date), "MMM d")})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Amount to Allocate (₱)
                  </label>
                  <Input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                {addContributionMutation.isError && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                    {addContributionMutation.error?.message}
                  </p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddContribution(false);
                      setSelectedTransactionId("");
                      setContributionAmount("");
                      addContributionMutation.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddContribution}
                    disabled={
                      !selectedTransactionId ||
                      !contributionAmount ||
                      Number(contributionAmount) <= 0 ||
                      addContributionMutation.isPending
                    }
                  >
                    {addContributionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : null}
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {/* Contribution List */}
            {contributionsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading contributions...
              </div>
            ) : !contributions || contributions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contributions yet. Add transactions to track your progress.
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {contributions.map((c: GoalContribution) => (
                  <div
                    key={c.uuid}
                    className="flex items-center justify-between p-2 rounded-md border bg-background"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {formatCurrency(Number(c.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(c.contributed_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => handleRemoveContribution(c.uuid)}
                      disabled={removeContributionMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
