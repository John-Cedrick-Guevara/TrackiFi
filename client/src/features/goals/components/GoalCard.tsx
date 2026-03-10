import type { Goal, SavingsBehavior } from "../types";
import { calculateForecast } from "../utils/forecasting";
import { formatCurrency } from "../utils/format";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Target, Calendar, AlertCircle, Edit, Trash2, Eye } from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  behavior: SavingsBehavior;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onView: (goal: Goal) => void;
}

export const GoalCard = ({
  goal,
  behavior,
  onEdit,
  onDelete,
  onView,
}: GoalCardProps) => {
  const forecast = calculateForecast(goal, behavior);
  const percentage = Math.min(
    100,
    Math.max(0, (goal.current_amount / goal.target_amount) * 100),
  );
  const isCompleted = goal.current_amount >= goal.target_amount;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {goal.title}
          </CardTitle>
          <Badge
            variant={
              isCompleted
                ? "default"
                : forecast.is_on_track
                  ? "outline"
                  : "destructive"
            }
          >
            {isCompleted
              ? "Completed"
              : forecast.is_on_track
                ? "On Track"
                : "At Risk"}
          </Badge>
        </div>
        {goal.target_date && (
          <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              Target: {format(parseISO(goal.target_date), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mt-4 mb-2 flex justify-between items-end">
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(goal.current_amount)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">saved</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {formatCurrency(goal.target_amount)}
          </div>
        </div>

        <Progress value={percentage} className="h-3 my-3" />

        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>{percentage.toFixed(1)}% Complete</span>
          <span>
            {formatCurrency(goal.target_amount - goal.current_amount)} remaining
          </span>
        </div>

        <div
          className={`text-sm p-3 rounded-md flex items-start gap-2 border ${
            isCompleted
              ? "text-primary border-primary/20 dark:bg-primary/20"
              : forecast.is_on_track
                ? "text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/200"
                : "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20"
          }`}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{forecast.forecast_message}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(goal)}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(goal)}
            title="Edit Goal"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(goal)}
            title="Delete Goal"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
