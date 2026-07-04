import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { label: "Dashboard", path: "/" },
  { label: "Expenses", path: "/expenses" },
  { label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`text-sm font-medium transition-colors px-4 py-2 rounded-md ${
                active
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
