import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import Dashbord from "@/features/dashboard/Dashbord";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Dashbord />
    </ProtectedRoute>
  );
}
