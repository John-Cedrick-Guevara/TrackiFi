import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers";
import { fetchInvestments, deleteInvestment } from "./api";
import type { Investment } from "./types";
import { InvestmentCard } from "./components/InvestmentCard";
import { InvestmentSummary } from "./components/InvestmentSummary";
import { AddInvestmentDialog } from "./components/AddInvestmentDialog";
import { UpdateValueDialog } from "./components/UpdateValueDialog";
import { CashOutDialog } from "./components/CashOutDialog";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Search, Filter, Loader2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Investments() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: investments = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No token");
      return fetchInvestments(token);
    },
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: async (id: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No token");
      return deleteInvestment(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast.success("Investment deleted");
    },
  });

  const filteredInvestments = investments.filter(
    (inv) =>
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUpdateClick = (inv: Investment) => {
    setSelectedInv(inv);
    setIsUpdateOpen(true);
  };

  const handleCashOutClick = (inv: Investment) => {
    setSelectedInv(inv);
    setIsCashOutOpen(true);
  };

  const onDeleteConfirm = (inv: Investment) => {
    if (
      confirm(
        `Are you sure you want to delete ${inv.name}? This will NOT reverse the initial cash flow entry.`,
      )
    ) {
      handleDelete(inv.uuid);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <p className="text-text-secondary animate-pulse">
          Loading your portfolio...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-800"
        >
          <Info className="h-4 w-4" />
          <AlertDescription>
            Failed to load investments:{" "}
            {(queryError as Error)?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["investments"] })
          }
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
            Investments
          </h1>
          <p className="text-text-secondary mt-1 text-lg">
            Track your long-term wealth growth manually.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-accent-primary text-white hover:bg-accent-primary/90 shadow-lg shadow-accent-primary/20 transition-all active:scale-95"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Investment
        </Button>
      </header>

      {investments.length > 0 && (
        <InvestmentSummary investments={investments} />
      )}

      <Alert className="mb-8 bg-bg-surface border-blue-500/30 text-blue-500">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          V1 Tracking: Value updates are manual. We don't fetch market prices or
          automate growth.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search investments..."
            className="pl-10 bg-bg-surface border-border text-text-primary focus:ring-accent-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="border-border text-text-secondary hover:text-text-primary"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {filteredInvestments.length === 0 ? (
        <Card className="bg-bg-surface border-border border-dashed py-16 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-bg-main rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-text-muted" />
          </div>
          <p className="text-text-primary font-medium text-lg">
            No investments found
          </p>
          <p className="text-text-secondary mb-6 max-w-xs">
            {searchQuery
              ? "Try adjusting your search query."
              : "Start building your wealth by adding your first investment."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-accent-primary"
            >
              Get Started
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.map((inv) => (
            <InvestmentCard
              key={inv.uuid}
              investment={inv}
              onUpdateValue={() => handleUpdateClick(inv)}
              onCashOut={() => handleCashOutClick(inv)}
              onDelete={() => onDeleteConfirm(inv)}
            />
          ))}
        </div>
      )}

      <AddInvestmentDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <UpdateValueDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        investment={selectedInv}
      />
      <CashOutDialog
        open={isCashOutOpen}
        onOpenChange={setIsCashOutOpen}
        investment={selectedInv}
      />
    </div>
  );
}
