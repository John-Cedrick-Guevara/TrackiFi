import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetchRecentTransactions } from "../api";
import { useSupabase } from "@/providers";
import type { Transaction } from "../types";

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

  const amountColor =
    transaction.type === "in" ? "text-green-400" : "text-white";

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl"></div>
        <div>
          <p className="text-base text-white">{categoryName}</p>
          <p className="text-xs text-gray-300">{formattedDate}</p>
        </div>
      </div>
      <div>
        <p className={`text-base font-medium ${amountColor}`}>
          {transaction.type === "in" ? "+" : "-"}
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
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/10"></div>
            <div>
              <div className="h-4 w-24 bg-white/10 rounded mb-1"></div>
              <div className="h-3 w-32 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="h-4 w-16 bg-white/10 rounded"></div>
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
    <section className="bg-accent-primary rounded-t-[50px] bottom-0 left-0 right-0 p-6 pb-0 h-full">
      <div className="flex justify-between items-center text-white">
        <p className="text-2xl font-semibold tracking-tight">
          Transaction History
        </p>
        <p className="text-sm text-text-white">View All</p>
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
