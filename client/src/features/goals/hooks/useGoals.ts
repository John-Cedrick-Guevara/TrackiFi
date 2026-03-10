import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsAPI } from "../services/goalsService";
import type {
  Goal,
  CreateGoalPayload,
  CreateContributionPayload,
} from "../types";
import { useToast } from "@/hooks/use-toast";

export const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: goalsAPI.getGoals,
  });
};

export const useGoal = (id: string) => {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => goalsAPI.getGoalById(id),
    enabled: !!id,
  });
};

export const useSavingsBehavior = () => {
  return useQuery({
    queryKey: ["behavior"],
    queryFn: goalsAPI.getBehavior,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalsAPI.createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "Goal created successfully!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      goalsAPI.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      toast({ title: "Goal updated successfully!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: goalsAPI.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "Goal deleted successfully!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });
};

// ==================
// CONTRIBUTION HOOKS
// ==================

export const useGoalContributions = (goalId: string) => {
  return useQuery({
    queryKey: ["goal-contributions", goalId],
    queryFn: () => goalsAPI.getContributions(goalId),
    enabled: !!goalId,
  });
};

export const useAddContribution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      goalId,
      payload,
    }: {
      goalId: string;
      payload: CreateContributionPayload;
    }) => goalsAPI.addContribution(goalId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({
        queryKey: ["goal-contributions", variables.goalId],
      });
      toast({ title: "Contribution added!", variant: "default" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add contribution",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveContribution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      goalId,
      contributionId,
    }: {
      goalId: string;
      contributionId: string;
    }) => goalsAPI.removeContribution(goalId, contributionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({
        queryKey: ["goal-contributions", variables.goalId],
      });
      toast({ title: "Contribution removed", variant: "default" });
    },
    onError: () => {
      toast({
        title: "Failed to remove contribution",
        variant: "destructive",
      });
    },
  });
};

export const useGoalPrediction = (
  goalId: string,
  interval: "daily" | "weekly" | "monthly" = "monthly",
) => {
  return useQuery({
    queryKey: ["goal-prediction", goalId, interval],
    queryFn: () => goalsAPI.generatePrediction(goalId, interval),
    enabled: !!goalId,
    retry: false,
  });
};
