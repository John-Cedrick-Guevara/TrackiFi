import React from "react";

const TransactionItem = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl"></div>
        <div>
          <p className="text-base text-white">Groceries</p>
          <p className="text-xs text-gray-300">June 10, 2026 - 12:00 PM</p>
        </div>
      </div>
      <div>
        <p className="text-base text-white">$100</p>
      </div>
    </div>
  );
};

const TransactionHistory = () => {
  return (
    <section className="bg-accent-primary rounded-t-[50px]  bottom-0 left-0 right-0 p-6 pb-0 h-full">
      <div className="flex justify-between items-center text-white">
        <p className="text-2xl font-semibold tracking-tight">
          Transaction History
        </p>
        <p className="text-sm text-text-white">View All</p>
      </div>

      <div className="space-y-4 mt-5 max-h-[50vh] overflow-y-scroll">
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
        <TransactionItem />
      </div>
    </section>
  );
};

export default TransactionHistory;
