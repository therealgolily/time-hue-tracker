// Main exports for the Debt Calculator app
// Copy this entire folder to another project to use the debt calculator

export { FinanceProvider, useFinance } from "./context/FinanceContext";
export * from "./types";
export * from "./lib/calculations";
export * from "./lib/storage";

// Components
export { AssetSection } from "./components/AssetSection";
export { BudgetSection } from "./components/BudgetSection";
export { CreditCardItem } from "./components/CreditCardItem";
export { CreditCardForm } from "./components/CreditCardForm";
export { NetWorthSummary } from "./components/NetWorthSummary";
export { NetWorthChart } from "./components/NetWorthChart";
export { ScenarioCard } from "./components/ScenarioCard";
export { EventForm } from "./components/EventForm";
export { EventTimeline } from "./components/EventTimeline";
export { EventBasedScenarioForm } from "./components/EventBasedScenarioForm";
export { PayoffChart } from "./components/PayoffChart";
export { InterestPrincipalChart } from "./components/InterestPrincipalChart";
export { MonthlyBreakdownTable } from "./components/MonthlyBreakdownTable";
export { CardBreakdown } from "./components/CardBreakdown";
export { ExpectedIncomeSection } from "./components/ExpectedIncomeSection";
export { PaymentDueDateCalendar } from "./components/PaymentDueDateCalendar";
export { ExpensesSection } from "./components/ExpensesSection";
export { OtherDebtsSection } from "./components/OtherDebtsSection";
