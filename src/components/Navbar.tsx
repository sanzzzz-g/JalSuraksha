import { Link, useLocation, useNavigate } from "react-router-dom";
import { Droplets, Menu, X, LogOut, History, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          
          <span className="font-heading text-xl font-bold text-gradient-ocean">JalSuraksha</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link to="/predict" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Predict</Link>
          <Link to="/join" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Join</Link>
          {user && <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"><History className="h-3.5 w-3.5" /> History</Link>}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> {user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1 text-muted-foreground"><LogOut className="h-3.5 w-3.5" /> Sign Out</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean rounded-full px-6">Sign In</Button>
            </Link>
          )}
        </div>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-3 pb-3">
          <Link to="/" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/predict" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Predict</Link>
          <Link to="/join" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Join</Link>
          {user && <Link to="/history" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>History</Link>}
          {user ? (
            <button onClick={() => { handleSignOut(); setOpen(false); }} className="text-sm text-muted-foreground text-left">Sign Out</button>
          ) : (
            <Link to="/auth" className="text-sm text-primary" onClick={() => setOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
