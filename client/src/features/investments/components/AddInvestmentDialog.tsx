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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useSupabase } from "@/providers";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createInvestment } from "../api";
import type { InvestmentType } from "../types";
import { toast } from "sonner";

export type AddInvestmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddInvestmentDialog({
  open,
  onOpenChange,
}: AddInvestmentDialogProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [type, setType] = useState<InvestmentType>("stock");
  const [principal, setPrincipal] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { mutate: handleAdd, isPending } = useMutation({
    mutationFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized");

      return createInvestment(
        {
          name,
          type,
          principal: parseFloat(principal),
          start_date: startDate,
        },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      // Also invalidate cash flow since it changes
      queryClient.invalidateQueries({ queryKey: ["todayCashFlow"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });

      toast.success("Investment created successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create investment");
    },
  });

  const resetForm = () => {
    setName("");
    setType("stock");
    setPrincipal("");
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  const isValid =
    name && type && principal && startDate && !isNaN(parseFloat(principal));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            New Investment
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-text-secondary">
              Investment Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. S&P 500 ETF, BTC, Savings Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-bg-main border-border text-text-primary"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type" className="text-text-secondary">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as InvestmentType)}
            >
              <SelectTrigger className="bg-bg-main border-border text-text-primary">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-bg-surface border-border">
                <SelectItem value="stock">Stock/ETF</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="fund">Mutual Fund</SelectItem>
                <SelectItem value="savings">High-Yield Savings</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-text-secondary">
              Amount Invested
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="bg-bg-main border-border text-text-primary"
            />
            <p className="text-xs text-text-muted italic">
              This amount will be deducted from your cash balance.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date" className="text-text-secondary">
              Start Date
            </Label>
            <Input
              id="date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-bg-main border-border text-text-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-text-secondary hover:text-text-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAdd()}
            disabled={!isValid || isPending}
            className="bg-accent-primary text-white hover:bg-accent-primary/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Investment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
