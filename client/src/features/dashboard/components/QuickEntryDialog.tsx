import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";
import { Loader2, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { useSupabase } from "@/providers";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { CashFlowSummary, Transaction } from "../types";

// --- Mock Data / Types for now ---
const FLOW_OUT_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
];

const FLOW_IN_CATEGORIES = [
  "Allowance",
  "Freelance",
  "Investments",
  "Gifts",
  "Other Income",
];

const TAGS = ["Need", "Want", "Social", "Treat", "Emergency"];

type TransactionType = "cash_in" | "cash_out";

export type QuickEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: TransactionType;
};

export function QuickEntryDialog({
  open,
  onOpenChange,
  defaultType = "cash_out",
}: QuickEntryDialogProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  // Consolidated Form Data
  const [formData, setFormData] = useState({
    amount: "",
    type: defaultType,
    category:
      defaultType === "cash_out"
        ? FLOW_OUT_CATEGORIES[0]
        : FLOW_IN_CATEGORIES[0],
    selectedTags: [] as string[],
  });

  // Sync internal type when defaultType changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        amount: "",
        type: defaultType,
        category:
          defaultType === "cash_out"
            ? FLOW_OUT_CATEGORIES[0]
            : FLOW_IN_CATEGORIES[0],
      }));
    }
  }, [open, defaultType]);

  // Handle Amount Change with Formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string to clear the input
    if (value === "") {
      setFormData((prev) => ({ ...prev, amount: "" }));
      return;
    }

    // Remove commas to get raw number string (e.g. "1,234" -> "1234")
    const rawValue = value.replace(/,/g, "");

    // Check if it's a valid number (allowing one decimal point)
    if (!/^\d*\.?\d*$/.test(rawValue)) {
      return;
    }

    setFormData((prev) => ({ ...prev, amount: rawValue }));
  };

  // Helper to format for display (add commas)
  // We keep trailing decimals/zeros so typing "10." or "10.0" works naturally
  const formatDisplayAmount = (val: string) => {
    if (!val) return "";

    const parts = val.split(".");
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Rejoin (limiting to standard number structure)
    return parts.join(".");
  };

  const { mutate: saveTransaction, isPending: isSaving } = useMutation({
    mutationFn: async (newTransaction: typeof formData) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("No token");

      const res = await fetch(`${API_BASE_URL}/api/cashflows/quick-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTransaction),
      });

      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["todayCashFlow"] });
      await queryClient.cancelQueries({ queryKey: ["recentTransactions"] });

      // Snapshot the previous value
      const previousSummary = queryClient.getQueryData<CashFlowSummary>([
        "todayCashFlow",
      ]);
      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "recentTransactions",
      ]);

      // Optimistically update to the new value
      if (previousSummary) {
        const amount = parseFloat(newEntry.amount);
        queryClient.setQueryData<CashFlowSummary>(["todayCashFlow"], {
          ...previousSummary,
          inflow:
            newEntry.type === "cash_in"
              ? previousSummary.inflow + amount
              : previousSummary.inflow,
          outflow:
            newEntry.type === "cash_out"
              ? previousSummary.outflow + amount
              : previousSummary.outflow,
        });
      }

      if (previousTransactions) {
        const optimisticTransaction: Transaction = {
          uuid: Math.random().toString(36).substring(7),
          amount: parseFloat(newEntry.amount),
          type: newEntry.type === "cash_in" ? "in" : "out",
          metadata: {
            category_name: newEntry.category,
            tags: newEntry.selectedTags,
          },
          logged_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Transaction[]>(
          ["recentTransactions"],
          [optimisticTransaction, ...previousTransactions],
        );
      }

      return { previousSummary, previousTransactions };
    },
    onError: (_err, _newEntry, context) => {
      // Rollback to the previous value if the mutation fails
      if (context?.previousSummary) {
        queryClient.setQueryData(["todayCashFlow"], context.previousSummary);
      }
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["recentTransactions"],
          context.previousTransactions,
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct server data
      queryClient.invalidateQueries({ queryKey: ["todayCashFlow"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
    },
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    if (!formData.amount) return;
    saveTransaction(formData);
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const tags = prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag];
      return { ...prev, selectedTags: tags };
    });
  };

  // --- Behavioral Logic (Goal Impact) ---
  const numAmount = parseFloat(formData.amount) || 0;

  const renderImpactMessage = () => {
    if (numAmount <= 0) return null;

    if (formData.type === "cash_out") {
      if (numAmount > 100) {
        return (
          <span className="flex items-center gap-1.5 text-amber-500">
            <TrendingDown className="w-4 h-4" />
            Slight delay for 'Vacation'
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1.5 text-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
          On track for 'Emergency Fund'
        </span>
      );
    }

    // Cash In
    return (
      <span className="flex items-center gap-1.5 text-accent-secondary">
        <TrendingUp className="w-4 h-4" />
        Boosts 'Savings Goal'
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90%] p-0 gap-0 overflow-hidden border-0 bg-bg-surface rounded-xl">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Quick Entry
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* 1. Primary Input (The "Hero") */}
          <div className="relative flex justify-center items-center py-4">
            <span
              className={cn(
                "text-4xl mr-2 font-medium transition-colors duration-300",
                formData.type === "cash_in"
                  ? "text-accent-secondary"
                  : "text-text-primary",
              )}
            >
              ₱
            </span>
            <Input
              type="text" // Use text to allow commas
              inputMode="decimal" // Mobile numeric keyboard
              placeholder="0.00"
              value={formatDisplayAmount(formData.amount)}
              onChange={handleAmountChange}
              className="border-none shadow-none text-5xl font-semibold h-auto p-0 w-48 text-center focus-visible:ring-0 placeholder:text-gray-300 bg-transparent"
              autoFocus
            />
          </div>

          {/* 2. Transaction Type Toggle */}
          <div className="flex bg-bg-main p-1 rounded-lg">
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: "cash_in",
                  category: FLOW_IN_CATEGORIES[0],
                }))
              }
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200",
                formData.type === "cash_in"
                  ? "bg-accent-secondary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              Cash In
            </button>
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: "cash_out",
                  category: FLOW_OUT_CATEGORIES[0],
                }))
              }
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200",
                formData.type === "cash_out"
                  ? "bg-text-primary text-bg-surface shadow-sm" // Dark neutral for spend
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              Cash Out
            </button>
          </div>

          {/* 3. Smart Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-medium pl-1">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger className="bg-bg-main border-none shadow-sm h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === "cash_out"
                    ? FLOW_OUT_CATEGORIES
                    : FLOW_IN_CATEGORIES
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-medium pl-1">
                Date
              </label>
              {/* Simplified Date for now - defaulting to Today */}
              <div className="flex items-center justify-center h-10 rounded-md bg-bg-main text-sm text-text-primary font-medium border border-transparent">
                Today
              </div>
            </div>
          </div>

          {/* 4. Behavioral "Nudge" (The "Why") */}
          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-medium pl-1">
              Tag (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer transition-colors px-3 py-1 font-normal",
                    formData.selectedTags.includes(tag)
                      ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
                      : "bg-bg-main text-text-secondary hover:bg-gray-100",
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* 5. Goal Impact Indicator */}
          <div className="min-h-6 flex items-center justify-center">
            {numAmount > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-xs font-medium">
                {renderImpactMessage()}
              </div>
            )}
          </div>
        </div>

        {/* 6. Footer Primary Action */}
        <DialogFooter className="p-4 pt-0 sm:justify-center">
          <Button
            className={cn(
              "w-full h-12 text-lg rounded-xl shadow-md transition-all",
              formData.type === "cash_in"
                ? "bg-accent-secondary hover:bg-accent-secondary/90"
                : "bg-accent-primary hover:bg-accent-primary/90",
            )}
            onClick={handleSave}
            disabled={!formData.amount || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ₱${formatDisplayAmount(formData.amount) || "0.00"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
