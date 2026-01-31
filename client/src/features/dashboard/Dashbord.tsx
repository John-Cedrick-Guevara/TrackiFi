import React from "react";
import { useQuery } from "@tanstack/react-query";
import QuickCard from "./components/QuickCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TransactionHistory from "./components/TransactionHistory";
import { QuickEntryDialog } from "./components/QuickEntryDialog";
import CashFlowPieChart from "./components/CashFlowPieChart";
import { fetchTodayCashFlow } from "./api";
import { useSupabase } from "@/providers";
import NavigationMenu from "@/components/NavigationMenu";

const Dashbord = () => {
  const supabase = useSupabase();
  const [isQuickEntryOpen, setIsQuickEntryOpen] = React.useState(false);
  const [quickEntryType, setQuickEntryType] = React.useState<
    "cash_in" | "cash_out"
  >("cash_out");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Fetch today's cash flow data
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
  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      <div className="space-y-6 px-6 pt-6">
        {/* Greeting and navigation */}
        <div className="flex justify-between items-center">
          {/* use profike */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-black"></div>
            <div>
              <p className="text-sm text-text-secondary">John Doe</p>
              {/* dropdown (monthly, yearly, etc) */}
              <DropdownMenu>
                <DropdownMenuTrigger className="" asChild>
                  <Button className="p-0 h-fit">
                    Monthly Budget <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>Monthly</DropdownMenuItem>
                    <DropdownMenuItem>Yearly</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* hamburger icon */}
          <Menu
            className="cursor-pointer"
            onClick={() => setIsMenuOpen(true)}
          />
        </div>

        {/* Budget Summary */}
        <div className="bg-bg-surface p-4 rounded-2xl shadow-xs flex items-start justify-between">
          <div>
            <p className="text-sm tracking-tight text-text-secondary">
              Track your balance today
            </p>
            <p className="text-4xl font-semibold tracking-wider text-text-primary">
              {isCashFlowLoading ? "..." : formatCurrency(netCashFlow)}
            </p>
            <Badge
              variant="secondary"
              className="bg-gray-400/20 backdrop-blur-xl text-text-primary mt-5"
            >
              {isCashFlowLoading
                ? "Loading..."
                : `${formatCurrency(netCashFlow)} net today`}
            </Badge>
          </div>
          {/* pie chart */}
          <CashFlowPieChart data={cashFlowData} isLoading={isCashFlowLoading} />
        </div>

        {/* quick cards */}
        <div className="grid grid-cols-2 gap-2">
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
      {/* Transaction History */}
      <TransactionHistory />

      {/* Quick Entry Dialog - Floating Trigger is inside for now */}
      <QuickEntryDialog
        open={isQuickEntryOpen}
        onOpenChange={setIsQuickEntryOpen}
        defaultType={quickEntryType}
      />

      {/* Optional: Floating FAB separate from dialog if needed, or rely on cards */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-accent-primary shadow-lg hover:bg-accent-primary/90 transition-transform hover:scale-105 active:scale-95 fixed bottom-6 right-6 z-50"
        onClick={() => openQuickEntry("cash_out")}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Navigation Menu */}
      <NavigationMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} />
    </div>
  );
};

export default Dashbord;
