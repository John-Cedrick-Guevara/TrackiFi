import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Menu,
  Bell,
  Settings,
  User,
  LogOut,
  Wallet,
  HelpCircle,
  Search,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [hasNotifications] = useState<boolean>(true);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Left Section - Mobile Menu + Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className={cn(
                "lg:hidden p-2 rounded-xl transition-all duration-200",
                "hover:bg-gray-100/80 active:scale-95",
              )}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions, categories..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button - Mobile */}
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-text-primary transition-colors" />
              {hasNotifications && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </>
              )}
            </button>

            {/* Settings (Desktop) */}
            <button className="hidden sm:block p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group">
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-text-primary transition-colors" />
            </button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group">
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      JD
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">
                        John Doe
                      </p>
                      <ChevronDown className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-text-secondary -mt-0.5">
                      Personal Account
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 mt-2 p-2 bg-white/95 backdrop-blur-xl border-gray-200 shadow-xl"
              >
                {/* User Info Header */}
                <div className="px-3 py-3 mb-1">
                  <p className="text-sm font-semibold text-text-primary">
                    John Doe
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    john.doe@email.com
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-lg">
                    <User className="w-4 h-4 mr-3 text-gray-600" />
                    <span className="text-sm">Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-lg">
                    <Wallet className="w-4 h-4 mr-3 text-gray-600" />
                    <span className="text-sm">Account & Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-lg">
                    <Settings className="w-4 h-4 mr-3 text-gray-600" />
                    <span className="text-sm">Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-lg">
                    <HelpCircle className="w-4 h-4 mr-3 text-gray-600" />
                    <span className="text-sm">Help & Support</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
