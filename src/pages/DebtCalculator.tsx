import { useEffect, useState } from 'react';
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

import { OtherDebtsSection } from '@/apps/debt-calculator/components/OtherDebtsSection';
import { MonthlyObligations } from '@/apps/debt-calculator/components/MonthlyObligations';
import { PaymentDueDateCalendar } from '@/apps/debt-calculator/components/PaymentDueDateCalendar';
import { DebtPayoffCalculator } from '@/apps/debt-calculator/components/DebtPayoffCalculator';
import { CreditCard } from '@/apps/debt-calculator/types';

const DebtCalculatorContent = () => {
  const { data, loading, addCreditCard, updateCreditCard, deleteCreditCard } = useFinance();
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);

  // Calculate totals
  const totalCreditCardDebt = data.creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalOtherDebts = data.otherDebts.reduce((sum, debt) => sum + debt.amount, 0);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }


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
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 border-2 border-foreground">
          <TabsTrigger value="monthly" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Monthly</TabsTrigger>
          <TabsTrigger value="calendar" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Calendar</TabsTrigger>
          <TabsTrigger value="assets" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Assets</TabsTrigger>
          <TabsTrigger value="debts" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Debts</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <MonthlyObligations />
        </TabsContent>

        <TabsContent value="calendar">
          <PaymentDueDateCalendar 
            creditCards={data.creditCards}
            expenses={data.budget.expenses}
          />
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
          <DebtPayoffCalculator />
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
