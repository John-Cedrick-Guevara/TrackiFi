import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalList } from "./GoalList";
import { GoalForm } from "./GoalForm";
import { useCreateGoal } from "../hooks/useGoals";

export const GoalsOverview = () => {
  const [isCreating, setIsCreating] = useState(false);
  const createGoalMutation = useCreateGoal();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and get intelligent forecasts on your financial
            targets.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </Button>
      </div>

      <GoalList />

      {/* Goal Creation Form */}
      <GoalForm
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={(data) => {
          createGoalMutation.mutate(data);
        }}
      />
    </div>
  );
};
