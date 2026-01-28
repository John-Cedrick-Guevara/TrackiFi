import React, { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

interface SignInFormProps {
  onSwitchMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSwitchMode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(formData.email, formData.password);
      // redirect logic here
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
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

        <div className="space-y-1">
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs font-medium text-accent-primary hover:text-purple-700 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign In
        </Button>

        <div className="text-center">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Don't have an account?{" "}
          </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-sm font-semibold text-[var(--color-accent-primary)] hover:underline focus:outline-none"
          >
            Create an account
          </button>
        </div>
      </div>
    </form>
  );
};
