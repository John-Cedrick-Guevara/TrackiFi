import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { GoalsOverview } from "@/features/goals/components/GoalsOverview";

// '/goals' is not yet included in the generated file routes — cast to any
// to avoid a type error while keeping runtime behavior.
export const Route = createFileRoute("/goals" as unknown as any)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 border-border/40 overflow-hidden font-sans">
        <main className="w-full max-w-7xl relative mx-auto z-10 space-y-8 animate-in">
          <GoalsOverview />
        </main>
      </div>
    </ProtectedRoute>
  );
}
