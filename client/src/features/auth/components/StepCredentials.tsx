import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react";
import { FormField } from "./FormField";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { Input } from "@/components/ui/input";

interface CredentialsData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
}

interface StepCredentialsProps {
  data: CredentialsData;
  onChange: (data: Partial<CredentialsData>) => void;
  errors: Partial<Record<keyof CredentialsData, string>>;
}

const inputVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  }),
};

export function StepCredentials({ data, onChange, errors }: StepCredentialsProps) {
  const [showPassword, setShowPassword] = useState(false);

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
          Create your account
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-2"
        >
          Your information is protected with bank-level encryption
        </motion.p>
      </div>

      {/* Name fields - two column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
          <FormField label="First Name" required error={errors.firstName}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="John"
                value={data.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                className="pl-10 input-finance"
              />
            </div>
          </FormField>
        </motion.div>

        <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
          <FormField label="Last Name" required error={errors.lastName}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Doe"
                value={data.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                className="pl-10 input-finance"
              />
            </div>
          </FormField>
        </motion.div>
      </div>

      {/* Email */}
      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
        <FormField
          label="Email Address"
          required
          error={errors.email}
          helperText="We'll send important updates to this address"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="john.doe@example.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="pl-10 input-finance"
            />
          </div>
        </FormField>
      </motion.div>

      {/* Password */}
      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
        <FormField label="Password" required error={errors.password}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a secure password"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="pl-10 pr-10 input-finance"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthIndicator password={data.password} />
        </FormField>
      </motion.div>

      {/* Contact Number */}
      <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
        <FormField
          label="Contact Number"
          error={errors.contactNumber}
          helperText="Optional - for account recovery"
        >
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={data.contactNumber}
              onChange={(e) => onChange({ contactNumber: e.target.value })}
              className="pl-10 input-finance"
            />
          </div>
        </FormField>
      </motion.div>
    </motion.div>
  );
}
