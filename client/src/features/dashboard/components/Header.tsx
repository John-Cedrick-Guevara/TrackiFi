import NavigationMenu from "@/components/NavigationMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <>
      <div className="flex justify-between items-center px-6 pt-6 bg-bg-surface">
        {/* use profike */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-black"></div>
          <div>
            <p className="text-sm text-text-secondary">John Doe</p>
            {/* dropdown (monthly, yearly, etc) */}
            <DropdownMenu>
              <DropdownMenuTrigger className="" asChild>
                <button className="p-0 h-fit">
                  Monthly Budget <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>Monthly</DropdownMenuItem>
                  <DropdownMenuItem>Yearly</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* hamburger icon */}
        <Menu className="cursor-pointer" onClick={() => setIsMenuOpen(true)} />
      </div>

      {/* Navigation Menu */}
      <NavigationMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} />
    </>
  );
};

export default Header;
