import { motion } from "framer-motion";
import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

interface StrengthConfig {
  level: StrengthLevel;
  label: string;
  color: string;
  width: string;
  segments: number;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo((): StrengthConfig => {
    if (!password) {
      return { level: "empty", label: "", color: "bg-muted", width: "0%", segments: 0 };
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { level: "weak", label: "Weak", color: "bg-destructive", width: "25%", segments: 1 };
    } else if (score <= 3) {
      return { level: "fair", label: "Fair", color: "bg-orange-400", width: "50%", segments: 2 };
    } else if (score <= 4) {
      return { level: "good", label: "Good", color: "bg-accent", width: "75%", segments: 3 };
    } else {
      return { level: "strong", label: "Strong", color: "bg-secondary", width: "100%", segments: 4 };
    }
  }, [password]);

  if (strength.level === "empty") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Segmented progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div key={segment} className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: segment <= strength.segments ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: segment * 0.05 }}
              className={`h-full ${strength.color}`}
            />
          </div>
        ))}
      </div>
      
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span
          className={`text-xs font-medium ${
            strength.level === "weak"
              ? "text-destructive"
              : strength.level === "fair"
              ? "text-orange-500"
              : strength.level === "good"
              ? "text-accent"
              : "text-secondary"
          }`}
        >
          {strength.label}
        </span>
      </div>
    </motion.div>
  );
}
