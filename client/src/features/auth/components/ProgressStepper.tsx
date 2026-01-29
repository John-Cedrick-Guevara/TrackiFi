import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step) => {
            const isComplete = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isPending = currentStep < step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10"
              >
                {/* Step indicator */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isComplete
                      ? "hsl(var(--secondary))"
                      : isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))",
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    text-sm font-medium transition-all duration-300
                    ${isComplete ? "text-secondary-foreground" : ""}
                    ${isActive ? "text-primary-foreground shadow-lg shadow-primary/25" : ""}
                    ${isPending ? "text-muted-foreground" : ""}
                  `}
                >
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </motion.div>

                {/* Step title - visible on larger screens */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                  className="mt-3 text-center hidden sm:block"
                >
                  <p
                    className={`text-xs font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Connecting lines */}
        <div className="absolute top-5 left-0 right-0 h-[2px] z-0">
          <div
            className="relative w-full h-full mx-auto"
            style={{ width: "calc(100% - 40px)", left: "20px" }}
          >
            <div className="absolute inset-0 bg-muted rounded-full" />
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute h-full bg-secondary rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Current step info - mobile */}
      <div className="sm:hidden text-center mb-6">
        <p className="text-sm font-medium text-foreground">
          {steps[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
}
