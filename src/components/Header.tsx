import { Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            WequiGuard
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/features" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/features") ? "text-primary" : "text-foreground"
            }`}
          >
            Features
          </Link>
          <Link 
            to="/setup" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/setup") ? "text-primary" : "text-foreground"
            }`}
          >
            Setup Guide
          </Link>
          <Link 
            to="/faq" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/faq") ? "text-primary" : "text-foreground"
            }`}
          >
            FAQ
          </Link>
          <Link to="/setup">
            <Button variant="default" size="sm" className="shadow-soft hover:shadow-medium transition-all">
              Get Started
            </Button>
          </Link>
        </div>
        
        <div className="md:hidden">
          <Link to="/setup">
            <Button variant="default" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
