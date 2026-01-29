import { motion } from "framer-motion";
import { Briefcase, Building2, Laptop, Layers } from "lucide-react";
import { FormField } from "./FormField";
import { Input } from "@/components/ui/input";

interface IncomeData {
  occupation: string;
  incomeSource: string;
}

interface StepIncomeSourceProps {
  data: IncomeData;
  onChange: (data: Partial<IncomeData>) => void;
  errors: Partial<Record<keyof IncomeData, string>>;
}

const incomeSources = [
  { id: "employment", label: "Employment", icon: Briefcase, description: "Full-time or part-time job" },
  { id: "freelance", label: "Freelance", icon: Laptop, description: "Contract or project-based work" },
  { id: "business", label: "Business", icon: Building2, description: "Self-owned business income" },
  { id: "allowance", label: "Allowance", icon: Building2, description: "Self-owned business income" },
  { id: "mixed", label: "Mixed", icon: Layers, description: "Multiple income streams" },
];

export function StepIncomeSource({ data, onChange, errors }: StepIncomeSourceProps) {
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
          Income details
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-2"
        >
          This helps us personalize your financial insights
        </motion.p>
      </div>

      {/* Occupation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FormField
          label="What's your occupation?"
          required
          error={errors.occupation}
          helperText="This helps us understand your financial context"
        >
          <Input
            type="text"
            placeholder="e.g., Software Engineer, Teacher, Consultant"
            value={data.occupation}
            onChange={(e) => onChange({ occupation: e.target.value })}
            className="input-finance"
          />
        </FormField>
      </motion.div>

      {/* Income Source Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FormField
          label="Primary source of income"
          required
          error={errors.incomeSource}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {incomeSources.map((source, index) => {
              const Icon = source.icon;
              const isSelected = data.incomeSource === source.id;

              return (
                <motion.button
                  key={source.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => onChange({ incomeSource: source.id })}
                  className={`
                    relative flex items-start gap-3 p-4 rounded-xl border-2 text-left
                    transition-all duration-200 cursor-pointer group
                    ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                    }
                  `}
                >
                  {/* Selection indicator */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
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

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isSelected ? "text-foreground" : "text-foreground"
                        }`}
                      >
                        {source.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {source.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </FormField>
      </motion.div>

      {/* Trust message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 pt-4"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
        <p className="text-xs text-muted-foreground">
          We only ask what's necessary to help you reach your financial goals
        </p>
      </motion.div>
    </motion.div>
  );
}
