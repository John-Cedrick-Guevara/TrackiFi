import type { GoalForecast } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";

export const ForecastInsight = ({
  forecast,
  isCompleted,
}: {
  forecast: GoalForecast;
  isCompleted: boolean;
}) => {
  if (isCompleted) {
    return (
      <Alert className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
        <CheckCircle2 className="h-4 w-4 stroke-primary" />
        <AlertTitle>Goal Reached</AlertTitle>
        <AlertDescription>{forecast.forecast_message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      className={
        forecast.is_on_track
          ? " text-emerald-700 border-emerald-500/20 dark:text-emerald-400 "
          : "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20"
      }
    >
      {forecast.is_on_track ? (
        <Info className="h-4 w-4 stroke-emerald-600 dark:stroke-emerald-400" />
      ) : (
        <AlertCircle className="h-4 w-4 stroke-destructive" />
      )}
      <AlertTitle>
        {forecast.is_on_track ? "On Track" : "Action Needed"}
      </AlertTitle>
      <AlertDescription>{forecast.forecast_message}</AlertDescription>
    </Alert>
  );
};
