import React from "react";
import type { AccountWithBalance } from "../types";

interface AccountSelectorProps {
  accounts: AccountWithBalance[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
  label?: string;
  disabled?: boolean;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onAccountChange,
  label = "Account",
  disabled = false,
}) => {
  return (
    <div className="account-selector">
      <label
        htmlFor="account-select"
        className="block text-sm font-medium mb-2"
      >
        {label}
      </label>
      <select
        id="account-select"
        value={selectedAccountId}
        onChange={(e) => onAccountChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} - ₱
            {account.balance.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </option>
        ))}
      </select>
    </div>
  );
};
