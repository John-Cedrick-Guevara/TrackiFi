import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signOut } = useAuth();
  return (
    <ProtectedRoute>
      <div>Hello "/dashboard"!</div>
      <button
        onClick={() => {
          signOut();
        }}
      >
        Sign Out
      </button>
    </ProtectedRoute>
  );
}
