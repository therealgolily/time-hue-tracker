import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScenarioResults } from './ScenarioCalculator';

interface ScenarioComparisonProps {
  baseline: ScenarioResults;
  scenario: ScenarioResults;
  scenarioName: string;
}

const formatDelta = (current: number, baseline: number) => {
  const delta = current - baseline;
  if (delta === 0) return { text: '—', color: 'text-muted-foreground', icon: Minus };
  if (delta > 0) return { text: `+$${delta.toLocaleString()}`, color: 'text-foreground', icon: TrendingUp };
  return { text: `-$${Math.abs(delta).toLocaleString()}`, color: 'text-muted-foreground', icon: TrendingDown };
};

const formatPercentDelta = (current: number, baseline: number) => {
  if (baseline === 0) return current > 0 ? '+∞%' : '—';
  const percent = ((current - baseline) / baseline) * 100;
  if (Math.abs(percent) < 0.1) return '—';
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

export const ScenarioComparison = ({ baseline, scenario, scenarioName }: ScenarioComparisonProps) => {
  const metrics = [
    { label: 'Monthly Revenue', baseline: baseline.monthlyRevenue, scenario: scenario.monthlyRevenue },
    { label: 'Monthly Expenses', baseline: baseline.monthlyExpenses, scenario: scenario.monthlyExpenses, invert: true },
    { label: 'Gross Profit', baseline: baseline.grossProfit, scenario: scenario.grossProfit },
    { label: 'Tax Reserve', baseline: baseline.estimatedMonthlyTax, scenario: scenario.estimatedMonthlyTax, invert: true },
    { label: 'Net Profit', baseline: baseline.netProfit, scenario: scenario.netProfit },
  ];

  return (
    <div className="border-2 border-foreground">
      <div className="border-b-2 border-foreground p-3 bg-muted/30">
        <h3 className="text-sm font-bold uppercase tracking-widest">Comparison: Current vs {scenarioName}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground bg-muted/20">
              <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Metric</th>
              <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Current</th>
              <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">{scenarioName}</th>
              <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Change</th>
              <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">%</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => {
              const delta = formatDelta(metric.scenario, metric.baseline);
              const isPositiveChange = metric.invert 
                ? metric.scenario < metric.baseline 
                : metric.scenario > metric.baseline;
              const isNegativeChange = metric.invert 
                ? metric.scenario > metric.baseline 
                : metric.scenario < metric.baseline;
              
              return (
                <tr key={metric.label} className={index < metrics.length - 1 ? 'border-b border-foreground/30' : ''}>
                  <td className="p-3 font-bold uppercase text-sm">{metric.label}</td>
                  <td className="p-3 text-right font-mono tabular-nums">${metric.baseline.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono tabular-nums font-bold">${metric.scenario.toLocaleString()}</td>
                  <td className={`p-3 text-right font-mono tabular-nums ${isPositiveChange ? 'text-foreground font-bold' : isNegativeChange ? 'text-muted-foreground' : ''}`}>
                    {delta.text}
                  </td>
                  <td className={`p-3 text-right font-mono tabular-nums text-xs ${isPositiveChange ? 'text-foreground' : isNegativeChange ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {formatPercentDelta(metric.scenario, metric.baseline)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bank Allocations */}
      {scenario.bankAllocations.length > 0 && (
        <div className="border-t-2 border-foreground p-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Scenario Bank Allocations (from ${scenario.netProfit.toLocaleString()} net)
          </p>
          <div className="flex flex-wrap gap-2">
            {scenario.bankAllocations.map((alloc, i) => (
              <div key={i} className="border border-foreground px-2 py-1">
                <span className="text-xs font-mono uppercase">{alloc.name}: </span>
                <span className="text-xs font-mono font-bold">${alloc.amount.toLocaleString()}</span>
                <span className="text-xs font-mono text-muted-foreground ml-1">({alloc.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Impact */}
      <div className="border-t-2 border-foreground p-3 bg-muted/20">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Annual Tax Impact</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground">Current Annual</p>
            <p className="text-sm font-mono font-bold">${baseline.estimatedAnnualTax.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">Scenario Annual</p>
            <p className="text-sm font-mono font-bold">${scenario.estimatedAnnualTax.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">Deductions Used</p>
            <p className="text-sm font-mono font-bold">${scenario.taxDeductionsTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">Tax Savings</p>
            <p className={`text-sm font-mono font-bold ${baseline.estimatedAnnualTax > scenario.estimatedAnnualTax ? 'text-foreground' : ''}`}>
              ${Math.max(0, baseline.estimatedAnnualTax - scenario.estimatedAnnualTax).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
