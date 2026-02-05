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
import { Loader2, AlertCircle } from "lucide-react";
import { useSupabase } from "@/providers";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { cashOut } from "../api";
import type { Investment } from "../types";
import { toast } from "sonner";

export type CashOutDialogProps = {
  investment: Investment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CashOutDialog({
  investment,
  open,
  onOpenChange,
}: CashOutDialogProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { mutate: handleCashOut, isPending } = useMutation({
    mutationFn: async () => {
      if (!investment) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized");

      return cashOut(
        investment.uuid,
        {
          amount: parseFloat(amount),
          date,
        },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({
        queryKey: ["investment", investment?.uuid],
      });
      queryClient.invalidateQueries({ queryKey: ["todayCashFlow"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });

      toast.success("Cash out recorded successfully");
      onOpenChange(false);
      setAmount("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record cash out");
    },
  });

  if (!investment) return null;

  const withdrawAmount = parseFloat(amount) || 0;
  const isOverLimit = withdrawAmount > investment.current_value;
  const isValid =
    amount && !isNaN(withdrawAmount) && withdrawAmount > 0 && !isOverLimit;

  // Calculate realized gain (placeholder logic, actual calculation happens on server)
  const estimatedGain =
    investment.current_value > 0
      ? (withdrawAmount / investment.current_value) *
        (investment.current_value - investment.principal)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-bg-surface border-border text-text-primary">
        <DialogHeader>
          <DialogTitle>Cash Out: {investment.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center px-4 py-2 bg-bg-main rounded-md border border-border">
            <span className="text-xs text-text-secondary uppercase">
              Available Value
            </span>
            <span className="text-lg font-semibold">
              ₱ {investment.current_value.toLocaleString()}
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-text-secondary">
              Withdrawal Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={
                isOverLimit ? "border-red-500" : "bg-bg-main border-border"
              }
            />
            {isOverLimit && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Cannot withdraw more than
                current value.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date" className="text-text-secondary">
              Date of Withdrawal
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-bg-main border-border"
            />
          </div>

          {isValid && (
            <div className="p-3 bg-accent-primary/10 rounded-md border border-accent-primary/20">
              <p className="text-sm text-accent-primary font-medium">
                Impact: Cash balance will increase by ₱{" "}
                {withdrawAmount.toLocaleString()}.
              </p>
              {estimatedGain > 0 && (
                <p className="text-xs text-accent-primary/80 mt-1 italic">
                  Estimated realized profit: ₱ {estimatedGain.toFixed(2)}
                </p>
              )}
            </div>
          )}
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
            onClick={() => handleCashOut()}
            disabled={!isValid || isPending}
            className="bg-accent-primary text-white hover:bg-accent-primary/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
