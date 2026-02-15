import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetchRecentTransactions } from "../api";
import { useSupabase } from "@/providers";
import type { Transaction } from "../types";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  Zap,
  Wallet,
  Briefcase,
  TrendingUp,
  Gift,
  Banknote,
  HelpCircle,
  ArrowLeftRight,
} from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Food & Dining":
      return <Utensils className="w-5 h-5" />;
    case "Transportation":
      return <Car className="w-5 h-5" />;
    case "Shopping":
      return <ShoppingBag className="w-5 h-5" />;
    case "Entertainment":
      return <Gamepad2 className="w-5 h-5" />;
    case "Health":
      return <HeartPulse className="w-5 h-5" />;
    case "Utilities":
      return <Zap className="w-5 h-5" />;
    case "Allowance":
      return <Wallet className="w-5 h-5" />;
    case "Freelance":
      return <Briefcase className="w-5 h-5" />;
    case "Investments":
      return <TrendingUp className="w-5 h-5" />;
    case "Gifts":
      return <Gift className="w-5 h-5" />;
    case "Other Income":
      return <Banknote className="w-5 h-5" />;
    default:
      return <HelpCircle className="w-5 h-5" />;
  }
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const categoryName = transaction.metadata?.category_name || "Uncategorized";
  const formattedAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(transaction.amount);

  const formattedDate = format(
    new Date(transaction.logged_at),
    "MMM dd, yyyy - hh:mm a",
  );

  const isIncome = transaction.type === "in";
  const isTransfer = transaction.type === "transfer";
  const statusColor = isIncome
    ? "text-emerald-500"
    : isTransfer
      ? "text-blue-500"
      : "text-amber-500";

  return (
    <div className="flex justify-between items-center bg-bg-surface p-3 rounded-xl border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/5",
            isIncome
              ? "bg-emerald-400/10"
              : isTransfer
                ? "bg-blue-400/10"
                : "bg-amber-400/10",
          )}
        >
          <div className={statusColor}>
            {isTransfer ? (
              <ArrowLeftRight className="w-5 h-5" />
            ) : (
              getCategoryIcon(categoryName)
            )}
          </div>
        </div>
        <div>
          <p className="text-base font-medium text-text-primary">
            {isTransfer ? "Transfer" : categoryName}
          </p>
          <p className="text-xs text-text-secondary">{formattedDate}</p>
        </div>
      </div>
      <div>
        <p className={cn("text-base font-semibold", statusColor)}>
          {isIncome ? "+" : isTransfer ? "" : "-"}
          {formattedAmount}
        </p>
      </div>
    </div>
  );
};

const TransactionHistorySkeleton = () => {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex justify-between items-center animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5"></div>
            <div>
              <div className="h-5 w-24 bg-white/10 rounded mb-1"></div>
              <div className="h-3 w-32 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="h-5 w-16 bg-white/10 rounded"></div>
        </div>
      ))}
    </>
  );
};

const TransactionHistory = () => {
  const supabase = useSupabase();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("No authentication token");
      }

      return fetchRecentTransactions(token);
    },
  });

  return (
    <section className="bg-bg-main p-6 pb-0 h-full w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center text-primary ">
        <p className="text-2xl font-semibold tracking-tight">
          Transaction History
        </p>
        <p className="text-sm text-text-primary">View All</p>
      </div>

      <div className="space-y-4 mt-5 max-h-[50vh] overflow-y-scroll">
        {isLoading ? (
          <TransactionHistorySkeleton />
        ) : transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.uuid} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">No transactions yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionHistory;
