import { motion } from "framer-motion";
import { Target, TrendingUp, Sparkles, Calendar, DollarSign } from "lucide-react";
import { FormField } from "./FormField";
import { Input } from "@/components/ui/input";

interface GoalData {
  goalType: string;
  targetAmount: string;
  startDate: string;
  endDate: string;
}

interface StepFinancialGoalsProps {
  data: GoalData;
  onChange: (data: Partial<GoalData>) => void;
  errors: Partial<Record<keyof GoalData, string>>;
}

const goalTypes = [
  {
    id: "savings",
    label: "Savings",
    icon: Target,
    description: "Build your emergency fund or save for a specific purchase",
    color: "text-secondary",
  },
  {
    id: "investment",
    label: "Investment",
    icon: TrendingUp,
    description: "Grow your wealth through stocks, bonds, or real estate",
    color: "text-primary",
  },
  {
    id: "custom",
    label: "Custom",
    icon: Sparkles,
    description: "Define your own unique financial goal",
    color: "text-accent",
  },
];

export function StepFinancialGoals({ data, onChange, errors }: StepFinancialGoalsProps) {
  // Format currency input
  const formatAmount = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (!numbers) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(numbers));
  };

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    onChange({ targetAmount: numbers });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Step header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-foreground"
        >
          Set your first goal
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-2"
        >
          Start with one goal — you can add more later
        </motion.p>
      </div>

      {/* Goal Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FormField label="What type of goal?" required error={errors.goalType}>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {goalTypes.map((goal, index) => {
              const Icon = goal.icon;
              const isSelected = data.goalType === goal.id;

              return (
                <motion.button
                  key={goal.id}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  onClick={() => onChange({ goalType: goal.id })}
                  className={`
                    relative flex items-center gap-4 p-4 rounded-xl border-2 text-left
                    transition-all duration-200 cursor-pointer 
                    ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-bg-main bg-card hover:border-bg-main/30 hover:bg-bg-main/30"
                    }
                  `}
                >
                  {/* Icon container */}
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                      transition-all duration-200
                      ${isSelected ? "bg-primary/10" : "bg-muted/50"}
                    `}
                  >
                    <Icon
                      className={`w-6 h-6 ${isSelected ? goal.color : "text-muted-foreground"}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{goal.label}</span>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {goal.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                      transition-all duration-200
                      ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-accent-primary"
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </FormField>
      </motion.div>

      {/* Target Amount */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <FormField
          label="Target amount"
          required
          error={errors.targetAmount}
          helperText="How much do you want to achieve?"
        >
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="10,000"
              value={formatAmount(data.targetAmount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-10 input-finance text-lg font-medium"
            />
          </div>
        </FormField>
      </motion.div>

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <FormField label="Start date" required error={errors.startDate}>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={data.startDate}
                onChange={(e) => onChange({ startDate: e.target.value })}
                className="pl-10 input-finance"
              />
            </div>
          </FormField>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FormField label="Target date" required error={errors.endDate}>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={data.endDate}
                onChange={(e) => onChange({ endDate: e.target.value })}
                className="pl-10 input-finance"
              />
            </div>
          </FormField>
        </motion.div>
      </div>

      {/* Motivational message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mt-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              You're taking the first step
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              TrackiFi will help you monitor progress and stay on track with personalized insights.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
