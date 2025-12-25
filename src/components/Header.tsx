import { Search, MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card py-3 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Search className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            PriceScout<span className="text-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="hidden sm:inline">Local Price Research</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
