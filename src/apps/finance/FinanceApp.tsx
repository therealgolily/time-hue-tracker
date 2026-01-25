import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Calculator,
  FlaskConical,
  Building2,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ClientsManager } from './components/ClientsManager';
import { ExpensesManager } from './components/ExpensesManager';
import { PaymentsManager } from './components/PaymentsManager';
import { MonthlySummary } from './components/MonthlySummary';
import { TaxView } from './components/TaxView';
import { BusinessProfile } from './components/BusinessProfile';
import { ScenarioPlayground } from './components/ScenarioPlayground';
import { useFinanceAuth } from './hooks/useFinanceAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'clients', label: 'CLIENTS', icon: Users },
  { id: 'expenses', label: 'EXPENSES', icon: Receipt },
  { id: 'payments', label: 'PAYMENTS', icon: CreditCard },
  { id: 'monthly', label: 'SUMMARY', icon: PieChart },
  { id: 'taxes', label: 'TAXES', icon: Calculator },
  { id: 'playground', label: 'SCENARIOS', icon: FlaskConical },
  { id: 'business', label: 'PROFILE', icon: Building2 },
];

interface FinanceAppProps {
  authRedirectPath?: string;
  basePath?: string;
}

const FinanceApp = ({ 
  authRedirectPath = '/business-finance/auth',
}: FinanceAppProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, signOut } = useFinanceAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(authRedirectPath);
    }
  }, [user, loading, navigate, authRedirectPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FinanceDashboard />;
      case 'clients':
        return <ClientsManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'payments':
        return <PaymentsManager />;
      case 'monthly':
        return <MonthlySummary />;
      case 'taxes':
        return <TaxView />;
      case 'playground':
        return <ScenarioPlayground />;
      case 'business':
        return <BusinessProfile />;
      default:
        return <FinanceDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 -ml-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-sm font-bold uppercase tracking-widest">Business Finance</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b-2 border-foreground overflow-x-auto">
        <div className="flex">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
                  "border-r-2 border-foreground last:border-r-0",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            S-Corp Financial Hub
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            Virginia
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FinanceApp;