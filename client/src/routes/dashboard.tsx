import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import Dashbord from "@/features/dashboard/Dashbord";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signOut } = useAuth();
  return (
    <ProtectedRoute>
      <Dashbord />
    </ProtectedRoute>
  );
}
