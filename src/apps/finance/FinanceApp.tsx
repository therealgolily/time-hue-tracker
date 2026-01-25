import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceSidebar } from './components/FinanceSidebar';
import { FinanceDashboard } from './components/FinanceDashboard';
import { ClientsManager } from './components/ClientsManager';
import { ExpensesManager } from './components/ExpensesManager';
import { PaymentsManager } from './components/PaymentsManager';
import { MonthlySummary } from './components/MonthlySummary';
import { TaxView } from './components/TaxView';
import { BusinessProfile } from './components/BusinessProfile';
import { ScenarioPlayground } from './components/ScenarioPlayground';
import { useFinanceAuth } from './hooks/useFinanceAuth';

/**
 * Finance App Main Component
 * 
 * This is the main entry point for the Finance app when used as a module.
 * 
 * Props:
 * - authRedirectPath: Where to redirect if not authenticated (default: '/finance/auth')
 * - basePath: Base path for the app (default: '/finance')
 */
interface FinanceAppProps {
  authRedirectPath?: string;
  basePath?: string;
}

const FinanceApp = ({ 
  authRedirectPath = '/finance/auth',
  basePath = '/finance' 
}: FinanceAppProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useFinanceAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(authRedirectPath);
    }
  }, [user, loading, navigate, authRedirectPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
    <div className="min-h-screen bg-background">
      <FinanceSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FinanceApp;
