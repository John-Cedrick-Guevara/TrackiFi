import React from "react";
import { useAccounts } from "../api";

export const BalanceCards: React.FC = () => {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        </div>
        <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to load account balances
      </div>
    );
  }

  const allowanceAccount = accounts?.find((acc) => acc.type === "allowance");
  const savingsAccount = accounts?.find((acc) => acc.type === "savings");

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Allowance Card */}
      <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-90">Saved Allowances</h3>
          <svg
            className="w-6 h-6 opacity-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div className="text-3xl font-bold">
          ₱{formatCurrency(allowanceAccount?.balance || 0)}
        </div>
        <div className="text-xs opacity-75 mt-2">Available for daily spend</div>
      </div>

      {/* Savings Card */}
      <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-90">Savings</h3>
          <svg
            className="w-6 h-6 opacity-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="text-3xl font-bold">
          ₱{formatCurrency(savingsAccount?.balance || 0)}
        </div>
        <div className="text-xs opacity-75 mt-2">Reserved money</div>
      </div>
    </div>
  );
};
