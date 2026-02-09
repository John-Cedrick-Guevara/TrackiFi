import { Link, useLocation } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  BarChart3,
  TrendingUp,
  Settings,
  X,
  Wallet,
  ChevronRight,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  open,
  onOpenChange,
  isCollapsed = false,
  onCollapsedChange,
}) => {
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Home,
      description: "Overview & quick actions",
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      description: "Financial insights",
    },
    {
      label: "Investments",
      path: "/investments",
      icon: TrendingUp,
      description: "Portfolio tracking",
    },
  ];

  const secondaryItems = [
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({
    item,
    isSecondary = false,
  }: {
    item: (typeof navItems)[0] | (typeof secondaryItems)[0];
    isSecondary?: boolean;
  }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const description = "description" in item ? item.description : "";

    const linkContent = (
      <Link
        to={item.path}
        onClick={() => onOpenChange(false)}
        className={cn(
          "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
          isCollapsed ? "justify-center" : "",
          !isSecondary && active
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
            : isSecondary && active
              ? "bg-gray-200/60 text-text-primary font-medium"
              : "text-text-secondary hover:bg-gray-100/80 hover:text-text-primary",
        )}
      >
        {!isSecondary && active && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        )}

        <Icon
          className={cn(
            "h-5 w-5 transition-transform group-hover:scale-110 shrink-0",
            !isSecondary && active
              ? "text-white"
              : active
                ? "text-text-primary"
                : "text-gray-600",
          )}
        />

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{item.label}</div>
              {!isSecondary && !active && description && (
                <div className="text-xs opacity-70 truncate">{description}</div>
              )}
            </div>

            {!isSecondary && active && (
              <ChevronRight className="h-4 w-4 text-white/80 shrink-0" />
            )}
          </>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  const NavContent = () => (
    <>
      {/* Sidebar Header */}
      <div
        className={cn(
          "py-5 border-b border-gray-200/60 transition-all duration-300",
          isCollapsed ? "px-3" : "px-6",
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-text-primary tracking-tight">
                TrackiFi
              </h2>
              <p className="text-xs text-text-secondary -mt-0.5">
                Finance Manager
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={cn(
          "flex-1 py-6 space-y-1 transition-all duration-300",
          isCollapsed ? "px-2" : "px-4",
        )}
      >
        <div className="mb-4">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Main Menu
            </p>
          )}
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Secondary Navigation */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              More
            </p>
          )}
          {secondaryItems.map((item) => (
            <NavLink key={item.path} item={item} isSecondary />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "py-4 border-t border-gray-200/60 transition-all duration-300",
          isCollapsed ? "px-2" : "px-4",
        )}
      >
        {/* Collapse Toggle Button */}
        {onCollapsedChange && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCollapsedChange(!isCollapsed)}
                  className={cn(
                    "w-full mb-3 p-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 flex items-center gap-2 text-gray-600 hover:text-text-primary group",
                    isCollapsed ? "justify-center" : "justify-start px-3",
                  )}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  ) : (
                    <>
                      <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                      <span className="text-sm font-medium">Collapse</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="font-medium">
                  Expand Sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}

        {!isCollapsed && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 mb-0.5">
                  Pro Tips
                </p>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  Track daily expenses for better insights
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-200/60 z-30 shadow-sm transition-all duration-300",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-white border-r border-gray-200/60"
        >
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 h-8 w-8 rounded-lg z-50 lg:hidden hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col h-full">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NavigationMenu;
