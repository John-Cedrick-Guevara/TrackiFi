import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useSupabase } from "@/providers";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateValue } from "../api";
import type { Investment } from "../types";
import { toast } from "sonner";

export type UpdateValueDialogProps = {
  investment: Investment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateValueDialog({
  investment,
  open,
  onOpenChange,
}: UpdateValueDialogProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [newValue, setNewValue] = useState("");
  const [notes, setNotes] = useState("");

  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: async () => {
      if (!investment) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized");

      return updateValue(
        investment.uuid,
        {
          value: parseFloat(newValue),
          notes: notes || undefined,
        },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({
        queryKey: ["investment", investment?.uuid],
      });
      toast.success("Value updated successfully");
      onOpenChange(false);
      setNewValue("");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update value");
    },
  });

  if (!investment) return null;

  const isValid = newValue && !isNaN(parseFloat(newValue));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-bg-surface border-border text-text-primary">
        <DialogHeader>
          <DialogTitle>Update Value: {investment.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1 px-4 py-2 bg-bg-main rounded-md border border-border">
            <span className="text-xs text-text-secondary uppercase">
              Current Value
            </span>
            <span className="text-lg font-semibold">
              ₱ {investment.current_value.toLocaleString()}
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="value" className="text-text-secondary">
              New Current Value
            </Label>
            <Input
              id="value"
              type="number"
              placeholder="0.00"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-bg-main border-border"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-text-secondary">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Why the change? (e.g. Market up, Dividend reinvested)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-bg-main border-border resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-text-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdate()}
            disabled={!isValid || isPending}
            className="bg-accent-secondary text-white hover:bg-accent-secondary/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Update Value
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
