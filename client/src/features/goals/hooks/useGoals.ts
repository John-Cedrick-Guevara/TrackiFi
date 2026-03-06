import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsAPI } from "../services/goalsService";
import type { Goal } from "../types";
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
    mutationFn: goalsAPI.createGoal,
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
