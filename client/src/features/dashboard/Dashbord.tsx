import React from "react";
import { useQuery } from "@tanstack/react-query";
import QuickCard from "./components/QuickCard";
import { Plus, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TransactionHistory from "./components/TransactionHistory";
import { QuickEntryDialog } from "./components/QuickEntryDialog";
import CashFlowPieChart from "./components/CashFlowPieChart";
import { fetchTodayCashFlow } from "./api";
import { useSupabase } from "@/providers";
import { BalanceCards } from "@/features/savings/components/BalanceCards";
import { TransferDialog } from "@/features/savings/components/TransferDialog";
import { useAccounts } from "@/features/savings/api";

const Dashbord = () => {
  const supabase = useSupabase();
  const [isQuickEntryOpen, setIsQuickEntryOpen] = React.useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = React.useState(false);
  const [quickEntryType, setQuickEntryType] = React.useState<
    "cash_in" | "cash_out"
  >("cash_out");

  // Fetch accounts to get Allowance balance
  const { data: accounts } = useAccounts();
  const allowanceAccount = accounts?.find((acc) => acc.type === "allowance");

  // Fetch today's cash flow data (for the pie chart)
  const { data: cashFlowData, isLoading: isCashFlowLoading } = useQuery({
    queryKey: ["todayCashFlow"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("No authentication token");
      }

      return fetchTodayCashFlow(token);
    },
  });

  const openQuickEntry = (type: "cash_in" | "cash_out") => {
    setQuickEntryType(type);
    setIsQuickEntryOpen(true);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalInflow = cashFlowData?.inflow || 0;
  const totalOutflow = cashFlowData?.outflow || 0;
  const allowanceBalance = allowanceAccount?.balance || 0;

  return (
    <div className="bg-bg-surface">
      <div className="flex flex-col md:flex-row gap-6 px-6 py-6 shadow-b-xl w-full max-w-7xl mx-auto">
        {/* Budget Summary - Now showing Allowance Balance */}
        <div className="bg-bg-surface max-md:p-4 rounded-2xl flex items-start justify-between flex-1">
          <div>
            <p className="text-sm tracking-tight text-text-secondary">
              Track your balance today
            </p>
            <p className="text-4xl font-semibold tracking-wider text-text-primary">
              {formatCurrency(allowanceBalance)}
            </p>
            <Badge
              variant="secondary"
              className="bg-emerald-400/20 backdrop-blur-xl text-emerald-600 mt-5 border border-emerald-500/20"
            >
              Today: +{formatCurrency(totalInflow)}
            </Badge>
            <p className="text-xs text-text-secondary mt-1 ml-1">
              {isCashFlowLoading ? "Updating..." : "Allowance added today"}
            </p>
          </div>
          {/* pie chart */}
          <CashFlowPieChart data={cashFlowData} isLoading={isCashFlowLoading} />
        </div>

        {/* quick cards */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          <QuickCard
            color="primary"
            className="p-2 h-fit"
            children={
              <div className="flex flex-col items-center justify-center">
                <Plus className="text-white w-12 h-12" />
                <p className="text-white/50 text-sm">Flow In</p>

                <hr className="w-full text-white my-1" />
                <p className="text-white text-base">
                  {isCashFlowLoading ? "..." : formatCurrency(totalInflow)}
                </p>
              </div>
            }
            onClick={() => openQuickEntry("cash_in")}
          />

          <QuickCard
            color="secondary"
            className="p-2 h-fit"
            children={
              <div className="flex flex-col items-center justify-center">
                <Plus className="text-white w-12 h-12" />
                <p className="text-white/50 text-sm">Flow Out</p>

                <hr className="w-full text-white my-1" />

                <p className="text-white text-base">
                  {isCashFlowLoading ? "..." : formatCurrency(totalOutflow)}
                </p>
              </div>
            }
            onClick={() => openQuickEntry("cash_out")}
          />
        </div>
      </div>

      {/* Account Balances */}
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Accounts</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer
          </Button>
        </div>
        <BalanceCards />
      </div>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Quick Entry Dialog - Floating Trigger is inside for now */}
      <QuickEntryDialog
        open={isQuickEntryOpen}
        onOpenChange={setIsQuickEntryOpen}
        defaultType={quickEntryType}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={isTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
      />
    </div>
  );
};

export default Dashbord;
