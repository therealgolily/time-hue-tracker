/**
 * Finance App - Portable Module
 * 
 * A complete financial dashboard for S-Corps with:
 * - Client management and revenue tracking
 * - Expense tracking with CSV import
 * - Payment recording
 * - Tax liability calculations
 * - Scenario playground for what-if analysis
 * - Monthly summaries and projections
 * 
 * USAGE:
 * 1. Copy this entire /apps/finance folder to your hub project
 * 2. Copy the Swiss theme CSS from finance.css to your index.css (optional)
 * 3. Run the database migrations in your hub project
 * 4. Add the route: <Route path="/finance/*" element={<FinanceApp />} />
 * 
 * DEPENDENCIES:
 * - Supabase (clients, expenses, payments, scenarios tables)
 * - shadcn/ui components
 * - date-fns, recharts, lucide-react
 */

// Main App Entry
export { default as FinanceApp } from './FinanceApp';
export { FinanceAuth } from './pages/FinanceAuth';

// Hooks
export { useFinanceAuth } from './hooks/useFinanceAuth';
export { useClients } from './hooks/useClients';
export { useExpenses } from './hooks/useExpenses';
export { usePayments } from './hooks/usePayments';
export { useEmployees } from './hooks/useEmployees';
export { useContractors } from './hooks/useContractors';
export { useScenarios } from './hooks/useScenarios';

// Components
export { FinanceDashboard } from './components/FinanceDashboard';
export { ClientsManager } from './components/ClientsManager';
export { ExpensesManager } from './components/ExpensesManager';
export { PaymentsManager } from './components/PaymentsManager';
export { MonthlySummary } from './components/MonthlySummary';
export { TaxView } from './components/TaxView';
export { BusinessProfile } from './components/BusinessProfile';
export { ScenarioPlayground } from './components/ScenarioPlayground';
export { TripExpenseTracker } from './components/TripExpenseTracker';
export { MetricCard } from './components/MetricCard';

// Data & Constants
export * from './data/businessData';
