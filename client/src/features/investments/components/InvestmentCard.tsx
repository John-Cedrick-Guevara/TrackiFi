import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  History,
  Wallet,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  LineChart as LineChartIcon,
} from "lucide-react";
import type { Investment } from "../types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ValueHistoryChart } from "./ValueHistoryChart";
import { useQuery } from "@tanstack/react-query";
import { fetchInvestment } from "../api";
import { useSupabase } from "@/providers";

interface InvestmentCardProps {
  investment: Investment;
  onUpdateValue: (inv: Investment) => void;
  onCashOut: (inv: Investment) => void;
  onDelete: (inv: Investment) => void;
}

export function InvestmentCard({
  investment,
  onUpdateValue,
  onCashOut,
  onDelete,
}: InvestmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const supabase = useSupabase();
  const isGain = investment.absolute_gain >= 0;

  const { data: details, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["investment", investment.uuid],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No token");
      return fetchInvestment(investment.uuid, token);
    },
    enabled: isExpanded,
  });

  const typeColors: Record<string, string> = {
    stock: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    crypto: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    fund: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    savings: "bg-green-500/10 text-green-500 border-green-500/20",
    other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <Card className="bg-bg-surface border-border overflow-hidden transition-all hover:border-accent-primary/50 group">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <Badge
            className={cn(
              "capitalize mb-1",
              typeColors[investment.type] || typeColors.other,
            )}
          >
            {investment.type}
          </Badge>
          <CardTitle className="text-xl text-text-primary group-hover:text-accent-primary transition-colors">
            {investment.name}
          </CardTitle>
          <p className="text-xs text-text-muted italic">
            Started: {new Date(investment.start_date).toLocaleDateString()}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-bg-surface border-border"
          >
            <DropdownMenuItem
              onClick={() => onDelete(investment)}
              className="text-red-500 focus:text-red-600 focus:bg-red-500/10"
            >
              Delete Investment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-text-secondary uppercase mb-1">
              Current Value
            </p>
            <p className="text-2xl font-bold text-text-primary">
              ₱ {investment.current_value.toLocaleString()}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 font-medium px-2 py-1 rounded-md",
              isGain
                ? "text-accent-primary bg-accent-primary/10"
                : "text-red-500 bg-red-500/10",
            )}
          >
            {isGain ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{Math.abs(investment.percentage_change).toFixed(2)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-t border-border">
          <div>
            <p className="text-[10px] text-text-secondary uppercase">
              Invested Amount
            </p>
            <p className="text-sm font-medium text-text-primary">
              ₱ {investment.principal.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-secondary uppercase">
              Total Gain/Loss
            </p>
            <p
              className={cn(
                "text-sm font-medium",
                isGain ? "text-accent-primary" : "text-red-500",
              )}
            >
              {isGain ? "+" : ""}₱ {investment.absolute_gain.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="ghost"
            className="w-full h-8 text-xs text-text-secondary hover:text-text-primary flex items-center justify-between px-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="flex items-center gap-2">
              <LineChartIcon className="h-3 w-3" />
              Performance History
            </span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>

          {isExpanded && (
            <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
              {isLoadingDetails ? (
                <div className="h-50 flex items-center justify-center">
                  <span className="text-xs text-text-muted italic animate-pulse">
                    Loading history...
                  </span>
                </div>
              ) : details?.history && details.history.length > 0 ? (
                <ValueHistoryChart
                  history={details.history}
                  principal={investment.principal}
                />
              ) : (
                <div className="h-25 flex items-center justify-center text-xs text-text-muted italic">
                  No history recorded yet.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-1 gap-2 pt-0">
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-accent-secondary text-white hover:bg-accent-secondary/90 h-9 text-xs"
            onClick={() => onUpdateValue(investment)}
          >
            <History className="h-3.5 w-3.5 mr-1.5" />
            Update Price
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-border text-text-secondary hover:text-text-primary h-9 text-xs"
            onClick={() => onCashOut(investment)}
          >
            <Wallet className="h-3.5 w-3.5 mr-1.5" />
            Cash Out
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
