import type { Goal, SavingsBehavior, CreateGoalPayload } from "../types";
import { GoalCard } from "./GoalCard";
import {
  useGoals,
  useSavingsBehavior,
  useDeleteGoal,
  useUpdateGoal,
} from "../hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { GoalForm } from "./GoalForm";
import { GoalDetailPanel } from "./GoalDetailPanel";
import { useState } from "react";

const DEFAULT_BEHAVIOR: SavingsBehavior = {
  average_monthly_savings: 0,
  average_monthly_spending: 0,
};

export const GoalList = () => {
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: behavior, isLoading: behaviorLoading } = useSavingsBehavior();
  const deleteGoalMutation = useDeleteGoal();
  const updateGoalMutation = useUpdateGoal();

  const [selectedGoalForDelete, setSelectedGoalForDelete] =
    useState<Goal | null>(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<Goal | null>(
    null,
  );
  const [selectedGoalForView, setSelectedGoalForView] = useState<Goal | null>(
    null,
  );

  const handleDelete = (id: string) => {
    deleteGoalMutation.mutate(id);
    setSelectedGoalForDelete(null);
  };

  const handleUpdate = (goalPayload: CreateGoalPayload) => {
    if (selectedGoalForEdit) {
      updateGoalMutation.mutate({
        id: selectedGoalForEdit.id,
        updates: {
          title: goalPayload.title,
          target_amount: goalPayload.target_amount,
          target_date: goalPayload.target_date,
          description: goalPayload.description,
          source_account_id: goalPayload.source_account_id,
        },
      });
      setSelectedGoalForEdit(null);
    }
  };

  if (goalsLoading || behaviorLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-8 border-2 border-dashed border-border/50 rounded-xl bg-muted/10 text-center dark:bg-muted/5">
        <TargetIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-2 text-foreground">
          No Financial Goals Yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Set targets for your savings. We'll track your progress and tell you
          exactly when you'll reach them based on your habits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            behavior={behavior ?? DEFAULT_BEHAVIOR}
            onDelete={setSelectedGoalForDelete}
            onEdit={setSelectedGoalForEdit}
            onView={setSelectedGoalForView}
          />
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={!!selectedGoalForDelete}
        onClose={() => setSelectedGoalForDelete(null)}
        goal={selectedGoalForDelete}
        onConfirm={handleDelete}
      />

      <GoalForm
        isOpen={!!selectedGoalForEdit}
        onClose={() => setSelectedGoalForEdit(null)}
        initialData={selectedGoalForEdit}
        onSubmit={handleUpdate}
      />

      <GoalDetailPanel
        isOpen={!!selectedGoalForView}
        onClose={() => setSelectedGoalForView(null)}
        goal={selectedGoalForView}
        behavior={behavior ?? DEFAULT_BEHAVIOR}
      />
    </div>
  );
};

// Temp icon component for empty state
const TargetIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
