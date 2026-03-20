import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  History,
  Wallet,
  Rocket,
  FlaskConical,
  Settings,
  HelpCircle,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'markets', label: 'Markets', icon: TrendingUp },
  { id: 'positions', label: 'Positions', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'ipo', label: 'IPO Center', icon: Rocket },
  { id: 'quant', label: 'Quant Lab', icon: FlaskConical },
];

const bottomItems = [
  { id: 'compliance', label: 'Risk & Compliance', icon: Shield },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ activePage, onPageChange }: SidebarProps) => {
  return (
    <aside className="w-16 lg:w-56 border-r border-border bg-sidebar flex flex-col shrink-0 h-[calc(100vh-3.5rem)]">
      <nav className="flex-1 py-3 px-2 lg:px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
              {isActive && (
                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border py-3 px-2 lg:px-3 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activePage === item.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
