import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart2,
  FileText,
  LogOut,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard },
  { to: "/income",   label: "Income",    icon: TrendingUp },
  { to: "/expenses", label: "Expenses",  icon: TrendingDown },
  { to: "/analytics",label: "Analytics", icon: BarChart2 },
  { to: "/reports",  label: "Reports",   icon: FileText },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-background" />
        </div>
        <span className="font-heading font-bold text-lg text-foreground tracking-tight">
          MoneyMade
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  // Close mobile drawer on route change
  const location = useLocation();
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 w-72 h-full bg-card border-r border-border transform transition-transform duration-250 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="font-heading font-bold text-base text-foreground">MoneyMade</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
};

export default Sidebar;
