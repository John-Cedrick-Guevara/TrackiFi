import React from "react";
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

const Dashbord = () => {
  const [isQuickEntryOpen, setIsQuickEntryOpen] = React.useState(false);
  const [quickEntryType, setQuickEntryType] = React.useState<
    "cash_in" | "cash_out"
  >("cash_out");

  const openQuickEntry = (type: "cash_in" | "cash_out") => {
    setQuickEntryType(type);
    setIsQuickEntryOpen(true);
  };

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
          <Menu />
        </div>

        {/* Budget Summary */}
        <div className="bg-bg-surface p-4 rounded-2xl shadow-xs flex items-start justify-between">
          <div>
            <p className="text-sm tracking-tight text-text-secondary">
              Track your spending
            </p>
            <p className="text-4xl font-semibold tracking-wider text-text-primary">
              P19,000
            </p>
            <Badge
              variant="secondary"
              className="bg-gray-400/20 backdrop-blur-xl text-text-primary mt-5"
            >
              P19,000 left
            </Badge>
          </div>
          {/* pie chart */}
          <div className="w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center text-white">
            {" "}
            pie chart to
          </div>
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
                <p className="text-white text-base">P300</p>
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
                <p className="text-white/50 text-sm">Flow In</p>

                <hr className="w-full text-white my-1" />

                <p className="text-white text-base">P300</p>
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
    </div>
  );
};

export default Dashbord;
