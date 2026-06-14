import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/map", label: "Map", icon: "ph:map-trifold" },
  { to: "/checkin", label: "Check in", icon: "ph:plus-circle" },
  { to: "/saved", label: "Saved", icon: "ph:bookmark-simple" },
  { to: "/settings", label: "Settings", icon: "ph:gear-six" },
];

export default function AppShell({ children, wide = false }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = (user?.name || "P")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarInner = (
    <>
      <div className="px-4 py-5">
        <NavLink to="/" className="flex items-center gap-2">
          <Icon icon="ph:coffee-fill" width="22" style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-lg tracking-tight">Perch</span>
        </NavLink>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium"
            style={({ isActive }) => ({
              background: isActive ? "var(--brand-soft)" : "transparent",
              color: isActive ? "var(--brand-600)" : "var(--text-2)",
            })}
          >
            <Icon icon={item.icon} width="19" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 hairline-t">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="w-9 h-9 rounded-full grid place-items-center text-xs font-semibold flex-shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}>
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.name || "You"}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-2)" }}>
              {user?.plan === "pro" ? "Pro" : "Free plan"}
            </p>
          </div>
        </div>
        <button
          onClick={() => { signOut(); navigate("/"); }}
          className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm nav-item"
          style={{ color: "var(--text-2)" }}
        >
          <Icon icon="ph:sign-out" width="17" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] flex" style={{ background: "var(--surface-2)" }}>
      {/* desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[256px] flex-shrink-0 hairline-r"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--hairline)" }}>
        {SidebarInner}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-[256px] h-full" style={{ background: "var(--surface)" }}>
            {SidebarInner}
          </div>
          <button className="flex-1 bg-black/30" onClick={() => setOpen(false)} aria-label="Close menu" />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* mobile topbar */}
        <header className="lg:hidden glass-nav flex items-center justify-between px-4 h-14">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Icon icon="ph:list" width="22" />
          </button>
          <span className="font-semibold tracking-tight">Perch</span>
          <span className="w-6" />
        </header>

        <main className={`flex-1 min-w-0 p-4 md:p-8 ${wide ? "" : "max-w-6xl mx-auto w-full"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}