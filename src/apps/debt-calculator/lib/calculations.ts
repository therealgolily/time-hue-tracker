import { 
  CreditCard, 
  MonthlyBreakdown, 
  CardPayoffDetail, 
  ScenarioResult, 
  PaymentScenario, 
  PlannedAssetSale 
} from "../types";

export const calculateNetIncome = (grossIncome: number, taxRate: number): number => {
  return grossIncome * (1 - taxRate / 100);
};

export const calculateAvailableForDebt = (
  netIncome: number,
  totalExpenses: number
): number => {
  return Math.max(0, netIncome - totalExpenses);
};

export const calculateMinimumPayments = (cards: CreditCard[]): number => {
  return cards.reduce((sum, card) => sum + card.minimumPayment, 0);
};

export const calculateTotalBalance = (cards: CreditCard[]): number => {
  return cards.reduce((sum, card) => sum + card.balance, 0);
};

export const calculateScenarioPayoff = (
  cards: CreditCard[],
  scenario: PaymentScenario,
  availableForDebt: number
): ScenarioResult => {
  // Sort cards by APR (highest first) for avalanche method
  const sortedCards = [...cards].sort((a, b) => b.apr - a.apr);
  
  let monthlyPayment: number;
  let targetMonths: number | undefined;

  if (scenario.monthlyPayment !== undefined) {
    monthlyPayment = scenario.monthlyPayment;
  } else if (scenario.targetMonths !== undefined) {
    targetMonths = scenario.targetMonths;
    monthlyPayment = calculateRequiredPayment(
      sortedCards,
      targetMonths,
      scenario.plannedAssetSales,
      scenario.freezeSpending
    );
  } else {
    // Default scenario uses available for debt
    monthlyPayment = availableForDebt;
  }

  const minimumPayments = calculateMinimumPayments(sortedCards);
  
  if (monthlyPayment < minimumPayments) {
    monthlyPayment = minimumPayments;
  }

  const cardDetails: CardPayoffDetail[] = [];
  const monthlyBreakdown: MonthlyBreakdown[] = [];
  
  // Initialize card balances
  const cardBalances = sortedCards.map(card => ({
    ...card,
    currentBalance: card.balance,
    totalInterest: 0,
    paidOff: false,
    payoffMonth: 0,
  }));

  let month = 0;
  let totalInterestPaid = 0;
  const maxMonths = 1200; // Safety limit of 100 years

  while (cardBalances.some(card => !card.paidOff && card.currentBalance > 0) && month < maxMonths) {
    month++;
    
    // Check for asset sales in this month
    let assetSaleAmount = 0;
    if (scenario.plannedAssetSales) {
      const salesThisMonth = scenario.plannedAssetSales.filter(sale => sale.month === month);
      assetSaleAmount = salesThisMonth.reduce((sum, sale) => sum + sale.salePrice, 0);
    }
    
    let remainingPayment = monthlyPayment + assetSaleAmount;
    let monthInterest = 0;
    let monthPrincipal = 0;
    let monthNewPurchases = 0;
    const startingBalance = cardBalances.reduce((sum, card) => sum + card.currentBalance, 0);

    // Pay minimum on all cards first
    for (const card of cardBalances) {
      if (card.paidOff || card.currentBalance <= 0) continue;

      const monthlyInterestRate = card.apr / 100 / 12;
      const interest = card.currentBalance * monthlyInterestRate;
      const minimumPayment = Math.min(card.minimumPayment, card.currentBalance + interest);
      const payment = Math.min(minimumPayment, remainingPayment, card.currentBalance + interest);

      card.currentBalance += interest;
      card.currentBalance -= payment;
      card.totalInterest += interest;
      
      monthInterest += interest;
      monthPrincipal += (payment - interest);
      remainingPayment -= payment;

      if (card.currentBalance <= 0.01) {
        card.currentBalance = 0;
        card.paidOff = true;
        card.payoffMonth = month;
      }
    }

    // Apply extra payment across highest-APR cards until funds are exhausted
    if (remainingPayment > 0) {
      for (const card of cardBalances) {
        if (remainingPayment <= 0) break;
        if (card.paidOff || card.currentBalance <= 0) continue;

        const extraPayment = Math.min(remainingPayment, card.currentBalance);
        card.currentBalance -= extraPayment;
        monthPrincipal += extraPayment;
        remainingPayment -= extraPayment;

        if (card.currentBalance <= 0.01) {
          card.currentBalance = 0;
          card.paidOff = true;
          card.payoffMonth = month;
        }
        // no break: continue applying leftover to next highest APR card
      }
    }

    // Add monthly purchases to cards that aren't paid off (unless spending is frozen)
    if (!scenario.freezeSpending) {
      for (const card of cardBalances) {
        if (!card.paidOff && card.currentBalance === 0 && card.monthlyPurchases > 0) {
          card.currentBalance += card.monthlyPurchases;
          monthNewPurchases += card.monthlyPurchases;
        } else if (card.currentBalance > 0 && card.monthlyPurchases > 0) {
          card.currentBalance += card.monthlyPurchases;
          monthNewPurchases += card.monthlyPurchases;
        }
      }
    }

    totalInterestPaid += monthInterest;
    const endingBalance = cardBalances.reduce((sum, card) => sum + card.currentBalance, 0);

    monthlyBreakdown.push({
      month,
      startingBalance,
      payment: monthlyPayment + assetSaleAmount - remainingPayment,
      interest: monthInterest,
      principal: monthPrincipal,
      newPurchases: monthNewPurchases,
      endingBalance,
      totalInterestPaid,
    });
  }

  // Create card details
  for (const card of sortedCards) {
    const cardData = cardBalances.find(c => c.id === card.id);
    if (!cardData) continue;

    cardDetails.push({
      cardId: card.id,
      cardName: card.name,
      payoffMonth: cardData.payoffMonth,
      totalInterest: cardData.totalInterest,
      breakdown: [], // Could be populated if needed
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    scenario,
    monthlyPayment,
    totalMonths: month,
    totalInterest: totalInterestPaid,
    payoffDate,
    cardDetails,
    monthlyBreakdown,
  };
};

const calculateRequiredPayment = (
  cards: CreditCard[], 
  targetMonths: number, 
  plannedAssetSales?: PlannedAssetSale[], 
  freezeSpending?: boolean
): number => {
  // Binary search to find required payment
  let low = calculateMinimumPayments(cards);
  let high = calculateTotalBalance(cards) * 2;
  let result = low;

  while (low <= high) {
    const mid = (low + high) / 2;
    const testScenario: PaymentScenario = {
      id: 'test',
      name: 'test',
      baseMonthlyPayment: mid,
      events: [],
      monthlyPayment: mid,
      plannedAssetSales: plannedAssetSales,
      freezeSpending: !!freezeSpending,
    };
    const testResult = calculateScenarioPayoff(cards, testScenario, mid);

    if (testResult.totalMonths <= targetMonths) {
      result = mid;
      high = mid - 0.01;
    } else {
      low = mid + 0.01;
    }

    // Prevent infinite loop
    if (high - low < 0.01) break;
  }

  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(date);
};

// Event-based scenario calculation
export const calculateEventBasedScenario = (
  cards: CreditCard[],
  scenario: PaymentScenario,
  baseAvailableCash: number
): ScenarioResult => {
  const MAX_MONTHS = 600;
  const sortedEvents = [...scenario.events].sort((a, b) => a.startMonth - b.startMonth);
  
  // Initialize card balances
  let cardBalances = cards.map(card => ({
    cardId: card.id,
    cardName: card.name,
    currentBalance: card.balance,
    apr: card.apr,
    minimumPayment: card.minimumPayment,
    monthlyPurchases: card.monthlyPurchases,
    totalInterest: 0,
    paidOff: false,
    payoffMonth: undefined as number | undefined,
  }));

  const monthlyBreakdown: MonthlyBreakdown[] = [];
  let currentPayment = scenario.baseMonthlyPayment;
  let currentAvailableCash = baseAvailableCash;
  let totalInterest = 0;

  // Track active recurring events
  const activeRecurringIncomes: Map<string, number> = new Map();
  const activeRecurringExpenses: Map<string, number> = new Map();

  for (let month = 1; month <= MAX_MONTHS; month++) {
    // Apply events for this month
    const monthEvents = sortedEvents.filter(e => e.startMonth === month);
    
    for (const event of monthEvents) {
      switch (event.type) {
        case 'payment_change':
          currentPayment = event.amount;
          break;
        case 'income_start':
          activeRecurringIncomes.set(event.id, event.amount);
          currentAvailableCash += event.amount;
          break;
        case 'income_end':
          // Find and remove matching income
          if (event.endMonth === month) {
            activeRecurringIncomes.delete(event.id);
            currentAvailableCash -= event.amount;
          }
          break;
        case 'expense_start':
          activeRecurringExpenses.set(event.id, event.amount);
          currentAvailableCash -= event.amount;
          break;
        case 'expense_end':
          // Find and remove matching expense
          if (event.endMonth === month) {
            activeRecurringExpenses.delete(event.id);
            currentAvailableCash += event.amount;
          }
          break;
      }
    }

    // Check if any recurring events end this month
    sortedEvents
      .filter(e => e.endMonth === month && (e.type === 'income_start' || e.type === 'expense_start'))
      .forEach(e => {
        if (e.type === 'income_start') {
          activeRecurringIncomes.delete(e.id);
          currentAvailableCash -= e.amount;
        } else if (e.type === 'expense_start') {
          activeRecurringExpenses.delete(e.id);
          currentAvailableCash += e.amount;
        }
      });

    // Calculate this month's payment
    let thisMonthPayment = currentPayment;
    
    // Add one-time events
    const oneTimeEvents = monthEvents.filter(e => 
      e.type === 'asset_sale' || e.type === 'windfall'
    );
    oneTimeEvents.forEach(e => {
      thisMonthPayment += e.amount;
    });

    // Subtract one-time expenses
    const oneTimeExpenses = monthEvents.filter(e => e.type === 'one_time_expense');
    oneTimeExpenses.forEach(e => {
      thisMonthPayment = Math.max(0, thisMonthPayment - e.amount);
    });

    // Calculate totals
    const startingBalance = cardBalances.reduce((sum, card) => sum + (card.paidOff ? 0 : card.currentBalance), 0);
    
    if (startingBalance <= 0) {
      // All cards paid off
      break;
    }

    let totalNewPurchases = 0;
    let monthInterest = 0;
    let monthPrincipal = 0;

    // Apply interest and purchases
    for (const card of cardBalances) {
      if (card.paidOff) continue;

      const monthlyRate = card.apr / 100 / 12;
      const interest = card.currentBalance * monthlyRate;
      card.currentBalance += interest;
      card.totalInterest += interest;
      monthInterest += interest;

      // Add monthly purchases if not frozen (check legacy flag)
      if (!scenario.freezeSpending) {
        card.currentBalance += card.monthlyPurchases;
        totalNewPurchases += card.monthlyPurchases;
      }
    }

    // Sort cards by APR (highest first) for payment allocation
    const sortedCards = cardBalances.filter(c => !c.paidOff).sort((a, b) => b.apr - a.apr);

    // Make minimum payments first
    let remainingPayment = thisMonthPayment;
    for (const card of sortedCards) {
      const minPayment = Math.min(card.minimumPayment, card.currentBalance);
      const payment = Math.min(minPayment, remainingPayment);
      card.currentBalance -= payment;
      remainingPayment -= payment;
      monthPrincipal += payment;

      if (card.currentBalance <= 0) {
        card.paidOff = true;
        card.payoffMonth = month;
      }
    }

    // Apply extra payment to highest APR cards
    while (remainingPayment > 0) {
      let appliedPayment = false;
      for (const card of sortedCards) {
        if (remainingPayment <= 0) break;
        if (card.paidOff || card.currentBalance <= 0) continue;

        const extraPayment = Math.min(remainingPayment, card.currentBalance);
        card.currentBalance -= extraPayment;
        remainingPayment -= extraPayment;
        monthPrincipal += extraPayment;
        appliedPayment = true;

        if (card.currentBalance <= 0) {
          card.paidOff = true;
          card.payoffMonth = month;
        }
      }
      if (!appliedPayment) break;
    }

    const endingBalance = cardBalances.reduce((sum, card) => sum + (card.paidOff ? 0 : card.currentBalance), 0);
    totalInterest += monthInterest;

    monthlyBreakdown.push({
      month,
      startingBalance,
      payment: thisMonthPayment,
      interest: monthInterest,
      principal: monthPrincipal,
      newPurchases: totalNewPurchases,
      endingBalance,
      totalInterestPaid: totalInterest,
    });
  }

  // Build card details
  const cardDetails: CardPayoffDetail[] = cardBalances.map(card => ({
    cardId: card.cardId,
    cardName: card.cardName,
    payoffMonth: card.payoffMonth || monthlyBreakdown.length,
    totalInterest: card.totalInterest,
    breakdown: [], // Can be populated if needed
  }));

  const totalMonths = monthlyBreakdown.length;
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + totalMonths);

  return {
    scenario,
    monthlyPayment: scenario.baseMonthlyPayment,
    totalMonths,
    totalInterest,
    payoffDate,
    cardDetails,
    monthlyBreakdown,
  };
};
