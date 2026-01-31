
# Consolidate Monthly Expenses and Debt Payments

## Goal
Create a unified "Monthly Obligations" view that shows everything you owe each month in one place - combining recurring expenses AND debt payments (credit card minimums, other debt payments).

## Proposed Structure

### Reduce from 5 tabs to 4 tabs:
```
[Monthly] [Assets] [Debts] [Income]
```

- **Monthly** (new consolidated tab) - Your total monthly obligations
- **Assets** - Your checking, savings, physical assets
- **Debts** - Debt details, credit cards, utilization (for managing debt strategy)
- **Income** - Expected income
- Remove Calendar as a separate tab (integrate due dates into Monthly view)

### Monthly Tab Layout

**Top Summary Card:**
- Total Monthly Obligations = Expenses + Credit Card Minimums + Other Debt Payments
- Quick breakdown showing the split

**Sections:**
1. **Credit Card Payments** - All card minimum payments with due dates
2. **Other Debt Payments** - Monthly payments for loans, payment plans
3. **Recurring Expenses** - Grouped by category (same as current)
4. **One-Time/Upcoming** - Non-recurring items due this month

**Each item shows:**
- Name
- Amount
- Due date (if set)
- Linked card indicator (for expenses charged to cards)

---

## Technical Details

### Files to Modify
1. **`src/pages/DebtCalculator.tsx`**
   - Change tabs from 5 to 4
   - Replace "Expenses" and "Calendar" tabs with new "Monthly" tab
   - Import new `MonthlyObligations` component

2. **New component: `src/apps/debt-calculator/components/MonthlyObligations.tsx`**
   - Consolidates expenses + debt payments
   - Shows total monthly obligations prominently
   - Groups items by type with due dates
   - Includes mini calendar or list view of upcoming payments

3. **Modify `DebtSummary.tsx`**
   - Keep debt-focused metrics (utilization, APR, total debt)
   - Remove monthly minimums card (moves to Monthly tab)

### Data Flow
- Pull `data.budget.expenses` for recurring expenses
- Pull `data.creditCards` for minimum payments
- Pull `data.otherDebts` for monthly debt payments
- Calculate totals and group by due date

### Monthly Total Calculation
```
Total Monthly = 
  SUM(expense.amount for recurring monthly expenses) +
  SUM(card.minimumPayment for all credit cards) +
  SUM(debt.monthlyPayment for debts with payment plans)
```
