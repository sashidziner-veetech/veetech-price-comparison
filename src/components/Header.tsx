import { MapPin } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import logo from "@/assets/logo.svg";

const Header = () => {
  return (
    <header className="border-b border-border bg-card py-2.5 sm:py-3 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Logo" className="h-8 sm:h-9 w-auto flex-shrink-0" />
          <span className="text-base sm:text-xl font-bold text-foreground truncate">
            Vee <span className="text-primary">Price Comparison Tool</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          <span className="hidden xs:inline sm:inline">Local Price Research</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
