import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";

export default function MarketingNav() {
  const { user } = useAuth();
  return (
    <header className="glass-nav">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Icon icon="ph:coffee-fill" width="24" style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-lg tracking-tight">Perch</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: "var(--text-2)" }}>
          <a href="#planner" className="hover:text-[color:var(--text-1)] transition-colors">Session planner</a>
          <a href="#freshness" className="hover:text-[color:var(--text-1)] transition-colors">How freshness works</a>
          <a href="#pricing" className="hover:text-[color:var(--text-1)] transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/map" className="btn-primary !py-2 text-sm">Open map</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2 text-sm hidden sm:inline-flex">Sign in</Link>
              <Link to="/register" className="btn-primary !py-2 text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}