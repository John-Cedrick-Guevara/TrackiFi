import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "../features/auth/components/AuthLayout";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <>
      {isSignIn ? (
        <SignInForm onSwitchMode={() => setIsSignIn(false)} />
      ) : (
        <SignUpForm onSwitchMode={() => setIsSignIn(true)} />
      )}
    </>
  );
}
