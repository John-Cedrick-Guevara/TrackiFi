import React, { useState } from "react";
import { useAccounts, useCreateTransfer } from "../api";
import { AccountSelector } from "./AccountSelector";

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferDialog: React.FC<TransferDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: accounts, isLoading } = useAccounts();
  const createTransfer = useCreateTransfer();

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromAccountId || !toAccountId) {
      setError("Please select both source and destination accounts");
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("Source and destination accounts must be different");
      return;
    }

    const amountNum = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      await createTransfer.mutateAsync({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: amountNum,
        description: description || undefined,
      });

      // Reset form and close
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create transfer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transfer Money</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoading ? (
            <div>Loading accounts...</div>
          ) : (
            <>
              <AccountSelector
                accounts={accounts || []}
                selectedAccountId={fromAccountId}
                onAccountChange={setFromAccountId}
                label="From Account"
              />

              <AccountSelector
                accounts={accounts || []}
                selectedAccountId={toAccountId}
                onAccountChange={setToAccountId}
                label="To Account"
              />

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-2"
                >
                  Amount
                </label>
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                >
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Monthly savings"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTransfer.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createTransfer.isPending ? "Transferring..." : "Transfer"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
