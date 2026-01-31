import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { FinanceProvider, useFinance } from '@/apps/debt-calculator/context/FinanceContext';

import { AssetSection } from '@/apps/debt-calculator/components/AssetSection';
import { DebtSummary } from '@/apps/debt-calculator/components/DebtSummary';
import { CreditCardForm } from '@/apps/debt-calculator/components/CreditCardForm';
import { CreditCardItem } from '@/apps/debt-calculator/components/CreditCardItem';
import { ExpectedIncomeSection } from '@/apps/debt-calculator/components/ExpectedIncomeSection';
import { OtherDebtsSection } from '@/apps/debt-calculator/components/OtherDebtsSection';
import { ScenarioCard } from '@/apps/debt-calculator/components/ScenarioCard';
import { PaymentDueDateCalendar } from '@/apps/debt-calculator/components/PaymentDueDateCalendar';
import { ExpensesSection } from '@/apps/debt-calculator/components/ExpensesSection';
import { EventBasedScenarioForm } from '@/apps/debt-calculator/components/EventBasedScenarioForm';
import { CreditCard, PaymentScenario, ScenarioResult, Expense } from '@/apps/debt-calculator/types';
import { 
  calculateNetIncome, 
  calculateAvailableForDebt, 
  calculateEventBasedScenario 
} from '@/apps/debt-calculator/lib/calculations';

const DebtCalculatorContent = () => {
  const { data, loading, addCreditCard, updateCreditCard, deleteCreditCard, updateExpense, addScenario, deleteScenario, selectScenario } = useFinance();
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [scenarioFormOpen, setScenarioFormOpen] = useState(false);

  // Calculate totals - moved before conditional return to fix hooks order
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

  // Calculate all scenario results - must be called before any conditional returns
  const allScenarioResults = useMemo(() => {
    const defaultScenario: PaymentScenario = {
      id: 'default',
      name: 'Minimum Payments',
      baseMonthlyPayment: data.creditCards.reduce((sum, card) => sum + card.minimumPayment, 0),
      events: [],
      isDefault: true,
    };

    const allScenarios = [defaultScenario, ...data.scenarios];
    
    return allScenarios.map(scenario => 
      calculateEventBasedScenario(data.creditCards, scenario, availableForDebt)
    );
  }, [data.creditCards, data.scenarios, availableForDebt]);

  const scenarioResult = useMemo(() => {
    const selectedScenario = data.scenarios.find(s => s.id === data.selectedScenarioId) || {
      id: 'default',
      name: 'Default',
      baseMonthlyPayment: availableForDebt,
      events: [],
    };
    
    return calculateEventBasedScenario(data.creditCards, selectedScenario, availableForDebt);
  }, [data.creditCards, data.scenarios, data.selectedScenarioId, availableForDebt]);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSaveScenario = (scenarioData: Omit<PaymentScenario, "id">) => {
    addScenario(scenarioData);
    setScenarioFormOpen(false);
  };

  const handleDeleteScenario = (id: string) => {
    deleteScenario(id);
  };

  const handleSelectScenario = (id: string) => {
    selectScenario(id);
  };

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

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    // Navigate to expenses tab when clicking expense in calendar
    // The ExpensesSection has its own form dialog
  };

  const handleAddDueDate = (type: 'card' | 'expense', itemId: string, dueDay: number) => {
    if (type === 'card') {
      updateCreditCard(itemId, { dueDay });
    } else {
      updateExpense(itemId, { dueDay });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 border-2 border-foreground">
          <TabsTrigger value="expenses" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Expenses</TabsTrigger>
          <TabsTrigger value="assets" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Assets</TabsTrigger>
          <TabsTrigger value="debts" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Debts</TabsTrigger>
          <TabsTrigger value="income" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Income</TabsTrigger>
          <TabsTrigger value="calendar" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Calendar</TabsTrigger>
          <TabsTrigger value="scenarios" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpensesSection />
        </TabsContent>

        <TabsContent value="assets">
          <AssetSection />
        </TabsContent>

        <TabsContent value="debts" className="space-y-6">
          <DebtSummary 
            creditCards={data.creditCards}
            otherDebts={data.otherDebts}
          />
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

        <TabsContent value="calendar">
          <PaymentDueDateCalendar 
            creditCards={data.creditCards}
            expenses={data.budget.expenses}
            onCardClick={handleEditCard}
            onExpenseClick={handleEditExpense}
            onAddDueDate={handleAddDueDate}
          />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
            <h2 className="text-xl font-bold uppercase tracking-wider">Payment Scenarios</h2>
            <Button onClick={() => setScenarioFormOpen(true)} className="border-2 border-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Create Scenario
            </Button>
          </div>
          
          <EventBasedScenarioForm 
            open={scenarioFormOpen} 
            onClose={() => setScenarioFormOpen(false)} 
            onSave={handleSaveScenario} 
          />

          {data.creditCards.length === 0 ? (
            <div className="border-2 border-dashed border-muted-foreground/30 p-8 text-center">
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                Add credit cards in the Debts tab to create payoff scenarios
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allScenarioResults.map((result) => (
                <ScenarioCard
                  key={result.scenario.id}
                  result={result}
                  isSelected={data.selectedScenarioId === result.scenario.id}
                  onSelect={() => handleSelectScenario(result.scenario.id)}
                  onDelete={result.scenario.isDefault ? undefined : () => handleDeleteScenario(result.scenario.id)}
                  totalAssets={totalAssets}
                />
              ))}
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
            <h1 className="text-sm font-bold uppercase tracking-widest">Personal Finance</h1>
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
