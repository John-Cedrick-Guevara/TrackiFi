// apps/web/src/features/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Header from "@/features/dashboard/components/Header";
import NavigationMenu from "@/components/NavigationMenu";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Persist sidebar state in localStorage
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // Save sidebar state to localStorage
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-surface via-bg-surface to-gray-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-surface via-bg-surface to-gray-50/30">
      {/* Desktop Sidebar - renders in NavigationMenu */}
      <NavigationMenu
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={handleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        {/* Pass menu control to Header */}
        <Header onMenuToggle={() => setIsMenuOpen(true)} />

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};
