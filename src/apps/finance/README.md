# Finance App Module

A complete financial dashboard for S-Corps, designed to be portable and embeddable in a hub project.

## Features

- **Dashboard**: Overview of revenue, expenses, profit, and tax estimates
- **Clients**: Manage client retainers and payment methods
- **Expenses**: Track business expenses with CSV import support
- **Payments**: Record payments received from clients
- **Monthly Summary**: Monthly cash flow breakdown and projections
- **Tax Liability**: S-Corp tax calculations with quarterly payment schedule
- **Scenario Playground**: What-if analysis for financial planning
- **Business Profile**: Company info, employees, and contractors

## Installation in Hub Project

### 1. Copy Files

Copy this entire `/apps/finance` folder to your hub project at `src/apps/finance/`.

### 2. Database Setup

Run these migrations in your hub project's Supabase:

```sql
-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  monthly_retainer NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own clients" ON public.clients FOR ALL USING (auth.uid() = user_id);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own payments" ON public.payments FOR ALL USING (auth.uid() = user_id);

-- Scenarios table
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own scenarios" ON public.scenarios FOR ALL USING (auth.uid() = user_id);
```

### 3. Add Route

In your hub's App.tsx or router:

```tsx
import FinanceApp from '@/apps/finance';
import { FinanceAuth } from '@/apps/finance';

// Add routes
<Route path="/finance/auth" element={<FinanceAuth />} />
<Route path="/finance/*" element={<FinanceApp />} />
```

### 4. Theme (Optional)

Copy the Swiss theme CSS variables from `styles/finance.css` to your hub's `index.css` if you want the red/black/white Swiss design.

## Dependencies

This module requires:
- `@supabase/supabase-js`
- `@tanstack/react-query`
- `date-fns`
- `recharts` (for charts)
- `lucide-react` (for icons)
- shadcn/ui components (Button, Card, Dialog, etc.)

## Customization

### Changing the base path

```tsx
<FinanceApp basePath="/my-finance" authRedirectPath="/my-finance/login" />
```

### Using your own auth

Replace imports of `useFinanceAuth` with your hub's auth hook.

### Theming

The app uses semantic Tailwind tokens (foreground, background, primary, etc.) and adapts to your theme automatically.

## File Structure

```
finance/
├── index.ts              # Main exports
├── FinanceApp.tsx        # Main app component
├── README.md             # This file
├── components/           # UI components
│   ├── FinanceSidebar.tsx
│   ├── FinanceDashboard.tsx
│   ├── ClientsManager.tsx
│   ├── ExpensesManager.tsx
│   ├── PaymentsManager.tsx
│   ├── MonthlySummary.tsx
│   ├── TaxView.tsx
│   ├── BusinessProfile.tsx
│   ├── ScenarioPlayground.tsx
│   ├── MetricCard.tsx
│   └── forms/
│       ├── ClientForm.tsx
│       ├── ExpenseForm.tsx
│       ├── PaymentForm.tsx
│       ├── EmployeeForm.tsx
│       ├── ContractorForm.tsx
│       └── ExpenseCSVImport.tsx
├── hooks/                # Data hooks
│   ├── useFinanceAuth.tsx
│   ├── useClients.tsx
│   ├── useExpenses.tsx
│   ├── usePayments.tsx
│   ├── useEmployees.tsx
│   ├── useContractors.tsx
│   └── useScenarios.tsx
├── pages/
│   └── FinanceAuth.tsx   # Auth page
├── data/
│   └── businessData.ts   # Default data & calculations
└── styles/
    └── finance.css       # Swiss theme CSS
```
