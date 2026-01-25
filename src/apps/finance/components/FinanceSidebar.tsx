import { 
  LayoutDashboard, 
  DollarSign, 
  Receipt, 
  PieChart, 
  Building2, 
  Calculator,
  TrendingUp,
  Users,
  CreditCard,
  LogOut,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinanceAuth } from '../hooks/useFinanceAuth';
import { Button } from '@/components/ui/button';

interface FinanceSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'monthly', label: 'Monthly Summary', icon: PieChart },
  { id: 'taxes', label: 'Tax Liability', icon: Calculator },
  { id: 'playground', label: 'Playground', icon: FlaskConical },
  { id: 'business', label: 'Business Profile', icon: Building2 },
];

export const FinanceSidebar = ({ activeTab, onTabChange }: FinanceSidebarProps) => {
  const { signOut, user } = useFinanceAuth();

  return (
    <aside className="w-64 bg-sidebar h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-lg">Finance</h1>
            <p className="text-xs text-sidebar-foreground/60">Financial Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'nav-link w-full',
                activeTab === item.id && 'nav-link-active'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 mb-3">
          <p>S-Corp • Virginia</p>
          {user && <p className="mt-1 truncate">{user.email}</p>}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
