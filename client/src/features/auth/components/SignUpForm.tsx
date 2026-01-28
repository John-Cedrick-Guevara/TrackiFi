import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { useAuth } from "../hooks/useAuth";
import type { SignUp } from "../types";
import { useNavigate } from "@tanstack/react-router";

interface SignUpFormProps {
  onSwitchMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchMode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState<SignUp>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    contact_number: "",
    occupation: "",
    income_source: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!validate()) setError("Passwords do not match");
      else {
        setIsLoading(true);
        const res = await signUp(formData);
        setIsLoading(false);
        // redirect logic here
        navigate({to: "/dashboard"});
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <Input
          id="first_name"
          label="First Name"
          placeholder="John"
          value={formData.first_name}
          onChange={handleChange}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        {/* Last Name */}
        <Input
          id="last_name"
          label="Last Name"
          placeholder="Doe"
          value={formData.last_name}
          onChange={handleChange}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        {/* Email */}
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          }
        />

        {/* Contact Number */}
        <Input
          id="contact_number"
          label="Contact Number"
          type="tel"
          placeholder="+63 912 345 6789"
          value={formData.contact_number}
          onChange={handleChange}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72 12.29 12.29 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 6 6l.37-.37a2 2 0 0 1 2.11-.45 12.29 12.29 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          }
        />

        {/* Occupation */}
        <Input
          id="occupation"
          label="Occupation"
          placeholder="Software Engineer"
          value={formData.occupation}
          onChange={handleChange}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3v6h12V3" />
              <path d="M3 9h18v12H3z" />
            </svg>
          }
        />

        {/* Income Source */}
        <Input
          id="income_source"
          label="Income Source"
          placeholder="Salary, Freelance, etc."
          value={formData.income_source}
          onChange={handleChange}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1v22" />
              <path d="M17 5H9v14h8" />
            </svg>
          }
        />

        {/* Password */}
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Create password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />

        {/* Confirm Password */}
        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
      </div>

      {/* Submit Button + Switch to Sign In */}
      <div className="space-y-4">
        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>

        <div className="text-center">
          <span className="text-sm text-text-secondary">
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-sm font-semibold text-accent-primary hover:underline focus:outline-none"
          >
            Sign in
          </button>
        </div>
      </div>
    </form>
  );
};
