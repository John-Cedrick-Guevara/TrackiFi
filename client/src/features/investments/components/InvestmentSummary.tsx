import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, PieChart } from "lucide-react";
import type { Investment } from "../types";
import { cn } from "@/lib/utils";

interface InvestmentSummaryProps {
  investments: Investment[];
}

export function InvestmentSummary({ investments }: InvestmentSummaryProps) {
  const totalPrincipal = investments.reduce(
    (sum, inv) => sum + inv.principal,
    0,
  );
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + inv.current_value,
    0,
  );
  const totalGain = totalCurrentValue - totalPrincipal;
  const totalPercentage =
    totalPrincipal > 0 ? (totalGain / totalPrincipal) * 100 : 0;
  const isGain = totalGain >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-bg-surface border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Wallet className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Invested</p>
              <p className="text-2xl font-bold text-text-primary">
                ₱ {totalPrincipal.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-bg-surface border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-secondary/10 rounded-full">
              <PieChart className="h-6 w-6 text-accent-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Current Net Value</p>
              <p className="text-2xl font-bold text-text-primary">
                ₱ {totalCurrentValue.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-bg-surface border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-full",
                isGain ? "bg-accent-primary/10" : "bg-red-500/10",
              )}
            >
              <TrendingUp
                className={cn(
                  "h-6 w-6",
                  isGain ? "text-accent-primary" : "text-red-500",
                )}
              />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Performance</p>
              <div className="flex items-baseline gap-2">
                <p
                  className={cn(
                    "text-2xl font-bold",
                    isGain ? "text-accent-primary" : "text-red-500",
                  )}
                >
                  {isGain ? "+" : ""}₱ {Math.abs(totalGain).toLocaleString()}
                </p>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isGain ? "text-accent-primary" : "text-red-500",
                  )}
                >
                  ({totalPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
