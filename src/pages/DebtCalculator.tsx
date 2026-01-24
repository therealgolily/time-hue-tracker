import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { FinanceProvider, useFinance } from '@/apps/debt-calculator/context/FinanceContext';
import { BudgetSection } from '@/apps/debt-calculator/components/BudgetSection';
import { AssetSection } from '@/apps/debt-calculator/components/AssetSection';
import { CreditCardForm } from '@/apps/debt-calculator/components/CreditCardForm';
import { CreditCardItem } from '@/apps/debt-calculator/components/CreditCardItem';
import { NetWorthSummary } from '@/apps/debt-calculator/components/NetWorthSummary';
import { NetWorthChart } from '@/apps/debt-calculator/components/NetWorthChart';
import { PayoffChart } from '@/apps/debt-calculator/components/PayoffChart';
import { ExpectedIncomeSection } from '@/apps/debt-calculator/components/ExpectedIncomeSection';
import { OtherDebtsSection } from '@/apps/debt-calculator/components/OtherDebtsSection';
import { CreditCard } from '@/apps/debt-calculator/types';
import { 
  calculateNetIncome, 
  calculateAvailableForDebt, 
  calculateEventBasedScenario 
} from '@/apps/debt-calculator/lib/calculations';

const DebtCalculatorContent = () => {
  const { data, addCreditCard, updateCreditCard, deleteCreditCard } = useFinance();
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);

  // Calculate totals
  const totalChecking = data.checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalSavings = data.savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPhysical = data.physicalAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalAssets = totalChecking + totalSavings + totalPhysical;

  const totalCreditCardDebt = data.creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalOtherDebts = data.otherDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalLiabilities = totalCreditCardDebt + totalOtherDebts;

  const netWorth = totalAssets - totalLiabilities;

  // Calculate scenario result
  const netIncome = calculateNetIncome(data.budget.grossIncome, data.budget.taxRate);
  const totalExpenses = data.budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const availableForDebt = calculateAvailableForDebt(netIncome, totalExpenses);

  const scenarioResult = useMemo(() => {
    const selectedScenario = data.scenarios.find(s => s.id === data.selectedScenarioId) || {
      id: 'default',
      name: 'Default',
      baseMonthlyPayment: availableForDebt,
      events: [],
    };
    
    return calculateEventBasedScenario(data.creditCards, selectedScenario, availableForDebt);
  }, [data.creditCards, data.scenarios, data.selectedScenarioId, availableForDebt]);

  const handleSaveCard = (cardData: Omit<CreditCard, "id"> | CreditCard) => {
    if ('id' in cardData) {
      updateCreditCard(cardData.id, cardData);
    } else {
      addCreditCard(cardData);
    }
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardFormOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    deleteCreditCard(id);
  };

  const handleCloseCardForm = () => {
    setCardFormOpen(false);
    setEditingCard(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Tabs defaultValue="budget" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 border-2 border-foreground">
          <TabsTrigger value="budget" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Budget</TabsTrigger>
          <TabsTrigger value="assets" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Assets</TabsTrigger>
          <TabsTrigger value="debts" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Debts</TabsTrigger>
          <TabsTrigger value="income" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Income</TabsTrigger>
          <TabsTrigger value="overview" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="budget">
          <BudgetSection />
        </TabsContent>

        <TabsContent value="assets">
          <AssetSection />
        </TabsContent>

        <TabsContent value="debts" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
              <h2 className="text-xl font-bold uppercase tracking-wider">Credit Cards</h2>
              <Button onClick={() => { setEditingCard(undefined); setCardFormOpen(true); }} className="border-2 border-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </div>
            <CreditCardForm 
              card={editingCard} 
              open={cardFormOpen} 
              onClose={handleCloseCardForm} 
              onSave={handleSaveCard} 
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.creditCards.map((card) => (
                <CreditCardItem 
                  key={card.id} 
                  card={card} 
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                />
              ))}
            </div>
          </div>
          <OtherDebtsSection />
        </TabsContent>

        <TabsContent value="income">
          <ExpectedIncomeSection />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <NetWorthSummary 
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            netWorth={netWorth}
          />
          {data.creditCards.length > 0 && scenarioResult.monthlyBreakdown.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <NetWorthChart result={scenarioResult} totalAssets={totalAssets} />
              <PayoffChart result={scenarioResult} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DebtCalculator = () => {
  useTheme();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Swiss-style header */}
        <header className="border-b-2 border-foreground">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-sm font-bold uppercase tracking-widest">Debt</h1>
          </div>
        </header>

        <main className="flex-1">
          <DebtCalculatorContent />
        </main>
      </div>
    </FinanceProvider>
  );
};

export default DebtCalculator;
