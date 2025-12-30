import { Search, MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card py-2.5 sm:py-3 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="text-base sm:text-xl font-bold text-foreground truncate">
            Vee <span className="text-primary">Price Comparison</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          <span className="hidden xs:inline sm:inline">Local Price Research</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
