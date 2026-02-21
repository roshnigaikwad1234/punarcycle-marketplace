import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard, Package, Zap, Handshake, Leaf, TrendingUp, User, LogOut, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/listings", icon: Package, label: "Waste Listings" },
  { to: "/dashboard/matches", icon: Zap, label: "AI Matches" },
  { to: "/dashboard/deals", icon: Handshake, label: "Deals" },
  { to: "/dashboard/impact", icon: Leaf, label: "Impact" },
  { to: "/dashboard/forecasting", icon: TrendingUp, label: "Forecasting" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
];

const DashboardLayout = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <img src={logo} alt="punarCYCLE" className="w-28" />
      </div>
      {profile && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile.name}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{profile.role.replace("both", "Generator & Consumer")}</p>
        </div>
      )}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-4 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground hidden sm:block">{profile?.name}</span>
        </header>
        <main className="p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
