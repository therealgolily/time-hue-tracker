import { useState } from 'react';
import { 
  FlaskConical, 
  Save, 
  Trash2, 
  Plus, 
  Copy, 
  ChevronDown,
  BarChart3,
  Settings2,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useScenarios, Scenario, ScenarioConfig } from '../hooks/useScenarios';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { useEmployees } from '../hooks/useEmployees';
import { ScenarioEditor, getDefaultConfig } from './scenario/ScenarioEditor';
import { ScenarioComparison } from './scenario/ScenarioComparison';
import { calculateScenario, calculateBaseline, ScenarioResults } from './scenario/ScenarioCalculator';

export const ScenarioPlayground = () => {
  const { scenarios, isLoading, saveScenario, updateScenario, deleteScenario } = useScenarios();
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { totalSalary } = useEmployees();

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [draftConfig, setDraftConfig] = useState<ScenarioConfig>(getDefaultConfig());
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [compareScenarioId, setCompareScenarioId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'compare'>('editor');

  // Calculate baseline and scenario results
  const baseline = calculateBaseline(clients, expenses, totalSalary);
  const scenarioResults = calculateScenario(draftConfig, clients, expenses, totalSalary);

  // Load a saved scenario
  const loadScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setDraftConfig(scenario.config);
    setDraftName(scenario.name);
    setDraftDescription(scenario.description || '');
    setIsDirty(false);
  };

  // Start a new scenario
  const startNewScenario = () => {
    setActiveScenario(null);
    setDraftConfig(getDefaultConfig());
    setDraftName('');
    setDraftDescription('');
    setIsDirty(false);
  };

  // Handle config changes
  const handleConfigChange = (config: ScenarioConfig) => {
    setDraftConfig(config);
    setIsDirty(true);
  };

  // Save the current scenario
  const handleSave = async () => {
    if (!draftName.trim()) return;

    if (activeScenario) {
      await updateScenario.mutateAsync({
        id: activeScenario.id,
        name: draftName,
        description: draftDescription,
        config: draftConfig,
      });
      setActiveScenario({ ...activeScenario, name: draftName, description: draftDescription, config: draftConfig });
    } else {
      const result = await saveScenario.mutateAsync({
        name: draftName,
        description: draftDescription,
        config: draftConfig,
      });
      if (result) {
        setActiveScenario({
          ...result,
          config: draftConfig,
        } as Scenario);
      }
    }
    setIsDirty(false);
    setShowSaveDialog(false);
  };

  // Duplicate a scenario
  const duplicateScenario = async (scenario: Scenario) => {
    await saveScenario.mutateAsync({
      name: `${scenario.name} (Copy)`,
      description: scenario.description || undefined,
      config: scenario.config,
    });
  };

  // Delete a scenario
  const handleDelete = async (id: string) => {
    await deleteScenario.mutateAsync(id);
    if (activeScenario?.id === id) {
      startNewScenario();
    }
    if (compareScenarioId === id) {
      setCompareScenarioId(null);
    }
  };

  // Get comparison scenario results
  const compareScenario = scenarios?.find(s => s.id === compareScenarioId);
  const compareResults = compareScenario 
    ? calculateScenario(compareScenario.config, clients, expenses, totalSalary)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-foreground">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Loading scenarios…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-foreground pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Scenario Playground</h2>
              <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
                Test different financial configurations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Scenario Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none border-2 border-foreground">
                  <Layers className="w-4 h-4 mr-2" />
                  {activeScenario?.name || 'New Scenario'}
                  {isDirty && <span className="ml-1 text-muted-foreground">*</span>}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-none border-2 border-foreground">
                <DropdownMenuItem onClick={startNewScenario} className="rounded-none">
                  <Plus className="w-4 h-4 mr-2" />
                  New Scenario
                </DropdownMenuItem>
                {scenarios && scenarios.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {scenarios.map(scenario => (
                      <DropdownMenuItem 
                        key={scenario.id} 
                        onClick={() => loadScenario(scenario)}
                        className="rounded-none flex items-center justify-between"
                      >
                        <span className="truncate">{scenario.name}</span>
                        {activeScenario?.id === scenario.id && (
                          <span className="text-xs bg-foreground text-background px-1">Active</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Save Button */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant={isDirty ? 'default' : 'outline'} 
                  className="rounded-none border-2 border-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none border-2 border-foreground">
                <DialogHeader>
                  <DialogTitle className="uppercase tracking-widest">Save Scenario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Name</label>
                    <Input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="e.g., Add 2 Clients + 401k"
                      className="mt-1 rounded-none border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description (optional)</label>
                    <Textarea
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      placeholder="What does this scenario test?"
                      className="mt-1 rounded-none border-2 border-foreground resize-none"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={!draftName.trim()}
                    className="w-full rounded-none"
                  >
                    {activeScenario ? 'Update Scenario' : 'Save Scenario'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Actions Menu */}
            {activeScenario && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-none border-2 border-foreground">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-foreground">
                  <DropdownMenuItem onClick={() => duplicateScenario(activeScenario)} className="rounded-none">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(activeScenario.id)} 
                    className="rounded-none text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-2 border-foreground">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
            activeTab === 'editor' 
              ? 'bg-foreground text-background' 
              : 'hover:bg-muted'
          }`}
        >
          <Settings2 className="w-4 h-4 inline mr-2" />
          Editor
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 px-4 py-2 text-xs font-mono uppercase tracking-widest border-l-2 border-foreground transition-colors ${
            activeTab === 'compare' 
              ? 'bg-foreground text-background' 
              : 'hover:bg-muted'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Compare
        </button>
      </div>

      {/* Content */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div>
            <ScenarioEditor config={draftConfig} onChange={handleConfigChange} />
          </div>

          {/* Live Results Panel */}
          <div className="space-y-4">
            <div className="border-2 border-foreground sticky top-4">
              <div className="border-b-2 border-foreground p-3 bg-muted/30">
                <h3 className="text-sm font-bold uppercase tracking-widest">Live Results</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-foreground p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Revenue</p>
                    <p className="text-xl font-bold tabular-nums">${scenarioResults.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="border border-foreground p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Expenses</p>
                    <p className="text-xl font-bold tabular-nums">${scenarioResults.monthlyExpenses.toLocaleString()}</p>
                  </div>
                  <div className="border border-foreground p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Gross Profit</p>
                    <p className="text-xl font-bold tabular-nums">${scenarioResults.grossProfit.toLocaleString()}</p>
                  </div>
                  <div className="border border-foreground p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Tax Reserve</p>
                    <p className="text-xl font-bold tabular-nums">${scenarioResults.estimatedMonthlyTax.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-2 border-foreground bg-foreground text-background p-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-background/70">Net Profit (Monthly)</p>
                  <p className="text-3xl font-bold tabular-nums">${scenarioResults.netProfit.toLocaleString()}</p>
                  <p className="text-xs font-mono text-background/70 mt-1">
                    Annual: ${(scenarioResults.netProfit * 12).toLocaleString()}
                  </p>
                </div>

                {/* Bank Allocations Preview */}
                {scenarioResults.bankAllocations.length > 0 && (
                  <div className="border border-foreground p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Allocations</p>
                    <div className="space-y-1">
                      {scenarioResults.bankAllocations.map((alloc, i) => (
                        <div key={i} className="flex justify-between text-sm font-mono">
                          <span>{alloc.name} ({alloc.percentage}%)</span>
                          <span className="font-bold">${alloc.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delta from Current */}
                <div className="border border-foreground/50 p-3 bg-muted/20">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">vs Current</p>
                  <div className="flex justify-between text-sm font-mono">
                    <span>Net Change</span>
                    <span className={scenarioResults.netProfit > baseline.netProfit ? 'font-bold' : 'text-muted-foreground'}>
                      {scenarioResults.netProfit >= baseline.netProfit ? '+' : ''}
                      ${(scenarioResults.netProfit - baseline.netProfit).toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-mono">
                    <span>Tax Savings</span>
                    <span className={baseline.estimatedAnnualTax > scenarioResults.estimatedAnnualTax ? 'font-bold' : 'text-muted-foreground'}>
                      ${Math.max(0, baseline.estimatedAnnualTax - scenarioResults.estimatedAnnualTax).toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Scenario Selector for Comparison */}
          <div className="border-2 border-foreground p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Select scenarios to compare
            </p>
            <div className="flex flex-wrap gap-2">
              {scenarios?.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => setCompareScenarioId(scenario.id === compareScenarioId ? null : scenario.id)}
                  className={`px-3 py-1 text-xs font-mono uppercase border-2 transition-colors ${
                    scenario.id === compareScenarioId
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground hover:bg-muted'
                  }`}
                >
                  {scenario.name}
                </button>
              ))}
              {(!scenarios || scenarios.length === 0) && (
                <p className="text-sm font-mono text-muted-foreground">No saved scenarios yet. Save one from the Editor tab.</p>
              )}
            </div>
          </div>

          {/* Current Draft vs Baseline */}
          <ScenarioComparison 
            baseline={baseline} 
            scenario={scenarioResults} 
            scenarioName={activeScenario?.name || 'Draft Scenario'} 
          />

          {/* Additional Comparison */}
          {compareScenario && compareResults && (
            <ScenarioComparison 
              baseline={baseline} 
              scenario={compareResults} 
              scenarioName={compareScenario.name} 
            />
          )}
        </div>
      )}

      {/* Saved Scenarios List */}
      {scenarios && scenarios.length > 0 && (
        <div className="border-2 border-foreground">
          <div className="border-b-2 border-foreground p-3 bg-muted/30">
            <h3 className="text-sm font-bold uppercase tracking-widest">Saved Scenarios ({scenarios.length})</h3>
          </div>
          <div className="divide-y divide-foreground/30">
            {scenarios.map(scenario => {
              const results = calculateScenario(scenario.config, clients, expenses, totalSalary);
              const delta = results.netProfit - baseline.netProfit;
              
              return (
                <div 
                  key={scenario.id} 
                  className={`p-3 flex items-center justify-between hover:bg-muted/20 cursor-pointer transition-colors ${
                    activeScenario?.id === scenario.id ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => loadScenario(scenario)}
                >
                  <div>
                    <p className="font-bold">{scenario.name}</p>
                    {scenario.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">{scenario.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">${results.netProfit.toLocaleString()}/mo</p>
                      <p className={`text-xs font-mono ${delta >= 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {delta >= 0 ? '+' : ''}{delta.toLocaleString()} vs current
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); duplicateScenario(scenario); }}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); handleDelete(scenario.id); }}
                        className="h-7 w-7 p-0 text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
