import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Save, 
  Trash2, 
  RotateCcw, 
  Snowflake, 
  Flame, 
  Layers, 
  Calendar, 
  DollarSign,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/calculations";
import { SavedPayoffScenario, SavedPayoffStrategy, SavedPayoffMode, SavedPayoffFrequency } from "../types";

interface SavedPayoffScenariosProps {
  currentConfig: {
    selectedCardIds: string[];
    mode: SavedPayoffMode;
    strategy: SavedPayoffStrategy;
    frequency: SavedPayoffFrequency;
    targetDate?: Date;
    fixedPaymentAmount?: number;
    totalInterest: number;
    totalMonths: number;
    payoffDate: Date;
  } | null;
  onLoadScenario: (scenario: SavedPayoffScenario) => void;
}

const strategyIcons: Record<SavedPayoffStrategy, React.ReactNode> = {
  snowball: <Snowflake className="h-4 w-4" />,
  avalanche: <Flame className="h-4 w-4" />,
  simultaneous: <Layers className="h-4 w-4" />,
};

const strategyNames: Record<SavedPayoffStrategy, string> = {
  snowball: "Snowball",
  avalanche: "Avalanche",
  simultaneous: "Simultaneous",
};

const modeIcons: Record<SavedPayoffMode, React.ReactNode> = {
  "target-date": <Calendar className="h-4 w-4" />,
  "fixed-payment": <DollarSign className="h-4 w-4" />,
};

export const SavedPayoffScenarios: React.FC<SavedPayoffScenariosProps> = ({
  currentConfig,
  onLoadScenario,
}) => {
  const { data, addSavedPayoffScenario, deleteSavedPayoffScenario } = useFinance();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  const savedScenarios = data.savedPayoffScenarios;

  const handleSave = () => {
    if (!currentConfig || !scenarioName.trim()) return;

    addSavedPayoffScenario({
      name: scenarioName.trim(),
      createdAt: new Date(),
      selectedCardIds: currentConfig.selectedCardIds,
      mode: currentConfig.mode,
      strategy: currentConfig.strategy,
      frequency: currentConfig.frequency,
      targetDate: currentConfig.targetDate,
      fixedPaymentAmount: currentConfig.fixedPaymentAmount,
      totalInterest: currentConfig.totalInterest,
      totalMonths: currentConfig.totalMonths,
      payoffDate: currentConfig.payoffDate,
    });

    setScenarioName("");
    setSaveDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setScenarioToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scenarioToDelete) {
      deleteSavedPayoffScenario(scenarioToDelete);
      setSelectedForCompare(prev => prev.filter(id => id !== scenarioToDelete));
    }
    setDeleteDialogOpen(false);
    setScenarioToDelete(null);
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const scenariosToCompare = savedScenarios.filter(s => selectedForCompare.includes(s.id));
  const bestInterest = scenariosToCompare.length > 0 
    ? Math.min(...scenariosToCompare.map(s => s.totalInterest))
    : 0;
  const bestTime = scenariosToCompare.length > 0 
    ? Math.min(...scenariosToCompare.map(s => s.totalMonths))
    : 0;

  return (
    <>
      <Card className="border-2 border-foreground">
        <CardHeader 
          className="border-b-2 border-foreground pb-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              <CardTitle className="text-lg font-bold uppercase tracking-wider">
                Saved Scenarios
              </CardTitle>
              {savedScenarios.length > 0 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {savedScenarios.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {expanded && savedScenarios.length > 1 && (
                <Button
                  variant={compareMode ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompareMode(!compareMode);
                    setSelectedForCompare([]);
                  }}
                  className="text-xs"
                >
                  <GitCompare className="h-3 w-3 mr-1" />
                  Compare
                </Button>
              )}
              {currentConfig && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSaveDialogOpen(true);
                  }}
                  className="text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save Current
                </Button>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="pt-4">
            {savedScenarios.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved scenarios yet</p>
                {currentConfig && (
                  <p className="text-xs mt-1">
                    Configure a payoff plan and click "Save Current" to save it
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Comparison View */}
                {compareMode && selectedForCompare.length >= 2 && (
                  <div className="p-4 bg-primary/5 border-2 border-primary rounded-lg mb-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-3">
                      Comparison ({selectedForCompare.length} scenarios)
                    </h4>
                    <div className="grid gap-2">
                      {scenariosToCompare.map(scenario => (
                        <div 
                          key={scenario.id}
                          className="flex items-center justify-between p-2 bg-background rounded"
                        >
                          <span className="font-medium text-sm">{scenario.name}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <div className={cn(
                              "flex items-center gap-1",
                              scenario.totalInterest === bestInterest && "text-primary font-bold"
                            )}>
                              <span className="text-muted-foreground text-xs">Interest:</span>
                              {formatCurrency(scenario.totalInterest)}
                              {scenario.totalInterest === bestInterest && (
                                <span className="text-[10px] bg-primary text-primary-foreground px-1 rounded">BEST</span>
                              )}
                            </div>
                            <div className={cn(
                              "flex items-center gap-1",
                              scenario.totalMonths === bestTime && "text-primary font-bold"
                            )}>
                              <span className="text-muted-foreground text-xs">Time:</span>
                              {scenario.totalMonths} mo
                              {scenario.totalMonths === bestTime && (
                                <span className="text-[10px] bg-primary text-primary-foreground px-1 rounded">FASTEST</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {scenariosToCompare.length >= 2 && (
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        {bestInterest > 0 && (
                          <span>
                            Best option saves{" "}
                            <span className="font-bold text-primary">
                              {formatCurrency(
                                Math.max(...scenariosToCompare.map(s => s.totalInterest)) - bestInterest
                              )}
                            </span>
                            {" "}in interest
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario List */}
                {savedScenarios.map(scenario => (
                  <div
                    key={scenario.id}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-colors",
                      compareMode && selectedForCompare.includes(scenario.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-foreground/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {compareMode && (
                          <Checkbox
                            checked={selectedForCompare.includes(scenario.id)}
                            onCheckedChange={() => toggleCompareSelection(scenario.id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">{scenario.name}</span>
                            <span className="text-primary">{strategyIcons[scenario.strategy]}</span>
                            <span className="text-muted-foreground text-xs">
                              {strategyNames[scenario.strategy]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              {modeIcons[scenario.mode]}
                              {scenario.mode === "target-date" 
                                ? `Target: ${format(new Date(scenario.targetDate!), "MMM yyyy")}`
                                : `${formatCurrency(scenario.fixedPaymentAmount || 0)}/${scenario.frequency === "monthly" ? "mo" : scenario.frequency === "biweekly" ? "2wk" : "wk"}`
                              }
                            </span>
                            <span>•</span>
                            <span>{scenario.selectedCardIds.length} cards</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-muted-foreground">Interest</span>
                              <p className="font-bold text-destructive">{formatCurrency(scenario.totalInterest)}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase text-muted-foreground">Payoff</span>
                              <p className="font-bold text-primary">{format(new Date(scenario.payoffDate), "MMM yyyy")}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase text-muted-foreground">Duration</span>
                              <p className="font-medium">{scenario.totalMonths} months</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!compareMode && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onLoadScenario(scenario)}
                            className="text-xs"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(scenario.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-foreground/10 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Saved {format(new Date(scenario.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                ))}

                {compareMode && selectedForCompare.length < 2 && (
                  <p className="text-xs text-center text-muted-foreground py-2">
                    Select at least 2 scenarios to compare
                  </p>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Payoff Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                placeholder="e.g., Aggressive 1-year plan"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                autoFocus
              />
            </div>
            {currentConfig && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Strategy:</span>
                  <span className="font-medium flex items-center gap-1">
                    {strategyIcons[currentConfig.strategy]}
                    {strategyNames[currentConfig.strategy]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-medium">
                    {currentConfig.mode === "target-date" ? "Target Date" : "Fixed Payment"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Interest:</span>
                  <span className="font-bold text-destructive">
                    {formatCurrency(currentConfig.totalInterest)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Payoff:</span>
                  <span className="font-bold text-primary">
                    {format(currentConfig.payoffDate, "MMM yyyy")} ({currentConfig.totalMonths} months)
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!scenarioName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved scenario. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
