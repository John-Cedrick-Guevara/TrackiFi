import { createFileRoute } from "@tanstack/react-router";
import Analytics from "@/features/analytics/Analytics";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsRoute,
});


function AnalyticsRoute() {
  return (
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  );
}
