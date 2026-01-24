# Debt Calculator App

A self-contained debt payoff calculator with event-based scenario planning.

## Usage

To use this app in another project:

1. Copy the entire `src/apps/debt-calculator` folder to your project
2. Install required dependencies: `recharts`, `date-fns`
3. Import and use the components:

```tsx
import { FinanceProvider } from "@/apps/debt-calculator";
import DebtCalculatorPage from "@/apps/debt-calculator/DebtCalculatorPage";

function App() {
  return (
    <FinanceProvider>
      <DebtCalculatorPage />
    </FinanceProvider>
  );
}
```

## Folder Structure

```
debt-calculator/
├── components/          # UI components
├── context/            # React context for state management
├── lib/                # Calculation logic and storage
├── types/              # TypeScript types
├── index.ts            # Main exports
└── README.md           # This file
```

## Features

- Credit card tracking with APR, limits, and utilization
- Budget management (income, expenses, tax rate)
- Asset tracking (checking, savings, physical assets)
- Event-based scenario planning
- Payoff projections and charts
- Net worth tracking
