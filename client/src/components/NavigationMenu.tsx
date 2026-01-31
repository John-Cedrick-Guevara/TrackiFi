import { Link, useLocation } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Home, BarChart3, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  open,
  onOpenChange,
}) => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-text-primary">
              TrackiFi
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-accent-primary text-white"
                    : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationMenu;
