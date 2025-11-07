import { Link, useLocation } from "react-router-dom";
import { Scale, Upload, FileText, Archive, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Precedents", href: "/precedents", icon: FileText },
  { name: "Archive", href: "/archive", icon: Archive },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center px-4">
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-primary">Judicial AI</span>
          </Link>
          
          <nav className="ml-auto flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Judicial AI Decision Support System &copy; 2025. For authorized judicial use only.</p>
      </footer>
    </div>
  );
};
