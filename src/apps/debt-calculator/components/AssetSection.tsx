import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, DollarSign, Wallet, Home, TrendingUp, PiggyBank } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { CheckingAccount, SavingsAccount, PhysicalAsset } from "../types";
import { formatCurrency } from "../lib/calculations";

export const AssetSection = () => {
  const {
    data,
    addCheckingAccount,
    updateCheckingAccount,
    deleteCheckingAccount,
    addSavingsAccount,
    updateSavingsAccount,
    deleteSavingsAccount,
    addPhysicalAsset,
    updatePhysicalAsset,
    deletePhysicalAsset,
  } = useFinance();

  const [checkingFormOpen, setCheckingFormOpen] = useState(false);
  const [savingsFormOpen, setSavingsFormOpen] = useState(false);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editingChecking, setEditingChecking] = useState<CheckingAccount | null>(null);
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);

  const [checkingForm, setCheckingForm] = useState({ name: "", balance: "" });
  const [savingsForm, setSavingsForm] = useState({ name: "", balance: "" });
  const [assetForm, setAssetForm] = useState({ name: "", value: "" });

  const totals = useMemo(() => {
    const totalChecking = data.checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalSavings = data.savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalPhysical = data.physicalAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiquid = totalChecking + totalSavings;
    const totalAssets = totalLiquid + totalPhysical;
    
    // Calculate total debt for net worth
    const totalCreditCardDebt = data.creditCards.reduce((sum, card) => sum + card.balance, 0);
    const totalOtherDebt = data.otherDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalDebt = totalCreditCardDebt + totalOtherDebt;
    const netWorth = totalAssets - totalDebt;

    return {
      totalChecking,
      totalSavings,
      totalPhysical,
      totalLiquid,
      totalAssets,
      totalDebt,
      netWorth,
    };
  }, [data.checkingAccounts, data.savingsAccounts, data.physicalAssets, data.creditCards, data.otherDebts]);

  const handleSaveChecking = () => {
    if (editingChecking) {
      updateCheckingAccount(editingChecking.id, {
        name: checkingForm.name,
        balance: parseFloat(checkingForm.balance) || 0,
      });
    } else {
      addCheckingAccount({
        name: checkingForm.name,
        balance: parseFloat(checkingForm.balance) || 0,
      });
    }
    setCheckingFormOpen(false);
    setEditingChecking(null);
    setCheckingForm({ name: "", balance: "" });
  };

  const handleSaveSavings = () => {
    if (editingSavings) {
      updateSavingsAccount(editingSavings.id, {
        name: savingsForm.name,
        balance: parseFloat(savingsForm.balance) || 0,
      });
    } else {
      addSavingsAccount({
        name: savingsForm.name,
        balance: parseFloat(savingsForm.balance) || 0,
      });
    }
    setSavingsFormOpen(false);
    setEditingSavings(null);
    setSavingsForm({ name: "", balance: "" });
  };

  const handleSaveAsset = () => {
    if (editingAsset) {
      updatePhysicalAsset(editingAsset.id, {
        name: assetForm.name,
        value: parseFloat(assetForm.value) || 0,
      });
    } else {
      addPhysicalAsset({
        name: assetForm.name,
        value: parseFloat(assetForm.value) || 0,
      });
    }
    setAssetFormOpen(false);
    setEditingAsset(null);
    setAssetForm({ name: "", value: "" });
  };

  const openEditChecking = (account: CheckingAccount) => {
    setEditingChecking(account);
    setCheckingForm({ name: account.name, balance: account.balance.toString() });
    setCheckingFormOpen(true);
  };

  const openEditSavings = (account: SavingsAccount) => {
    setEditingSavings(account);
    setSavingsForm({ name: account.name, balance: account.balance.toString() });
    setSavingsFormOpen(true);
  };

  const openEditAsset = (asset: PhysicalAsset) => {
    setEditingAsset(asset);
    setAssetForm({ name: asset.name, value: asset.value.toString() });
    setAssetFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Assets Overview Summary */}
      <Card className="border-2 border-foreground bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Net Worth</p>
              <p className={`text-4xl font-bold mt-1 ${totals.netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                {formatCurrency(totals.netWorth)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-foreground/20">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total Assets</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.totalAssets)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total Debt</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(totals.totalDebt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Liquid Cash</p>
              <p className="text-lg font-bold">{formatCurrency(totals.totalLiquid)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Physical Assets</p>
              <p className="text-lg font-bold">{formatCurrency(totals.totalPhysical)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Checking</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(totals.totalChecking)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.checkingAccounts.length} account{data.checkingAccounts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Savings</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(totals.totalSavings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.savingsAccounts.length} account{data.savingsAccounts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Physical</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(totals.totalPhysical)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.physicalAssets.length} asset{data.physicalAssets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Home className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checking Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
          <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Checking Accounts
          </h2>
          <Button onClick={() => { setEditingChecking(null); setCheckingForm({ name: "", balance: "" }); setCheckingFormOpen(true); }} size="sm" className="border-2 border-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
        {data.checkingAccounts.length > 0 ? (
          <div className="space-y-2">
            {data.checkingAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{account.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(account.balance)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEditChecking(account)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCheckingAccount(account.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No checking accounts added yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Savings Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
          <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Savings Accounts
          </h2>
          <Button onClick={() => { setEditingSavings(null); setSavingsForm({ name: "", balance: "" }); setSavingsFormOpen(true); }} size="sm" className="border-2 border-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
        {data.savingsAccounts.length > 0 ? (
          <div className="space-y-2">
            {data.savingsAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{account.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(account.balance)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEditSavings(account)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteSavingsAccount(account.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No savings accounts added yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Physical Assets */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
          <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            <Home className="h-5 w-5" />
            Physical Assets
          </h2>
          <Button onClick={() => { setEditingAsset(null); setAssetForm({ name: "", value: "" }); setAssetFormOpen(true); }} size="sm" className="border-2 border-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
        {data.physicalAssets.length > 0 ? (
          <div className="space-y-2">
            {data.physicalAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{asset.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(asset.value)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEditAsset(asset)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePhysicalAsset(asset.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No physical assets added yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Checking Form Dialog */}
      <Dialog open={checkingFormOpen} onOpenChange={setCheckingFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChecking ? "Edit" : "Add"} Checking Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="checking-name">Account Name</Label>
              <Input
                id="checking-name"
                value={checkingForm.name}
                onChange={(e) => setCheckingForm({ ...checkingForm, name: e.target.value })}
                placeholder="e.g., Chase Checking"
              />
            </div>
            <div>
              <Label htmlFor="checking-balance">Balance</Label>
              <Input
                id="checking-balance"
                type="number"
                step="0.01"
                value={checkingForm.balance}
                onChange={(e) => setCheckingForm({ ...checkingForm, balance: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleSaveChecking} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Savings Form Dialog */}
      <Dialog open={savingsFormOpen} onOpenChange={setSavingsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSavings ? "Edit" : "Add"} Savings Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="savings-name">Account Name</Label>
              <Input
                id="savings-name"
                value={savingsForm.name}
                onChange={(e) => setSavingsForm({ ...savingsForm, name: e.target.value })}
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div>
              <Label htmlFor="savings-balance">Balance</Label>
              <Input
                id="savings-balance"
                type="number"
                step="0.01"
                value={savingsForm.balance}
                onChange={(e) => setSavingsForm({ ...savingsForm, balance: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleSaveSavings} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Physical Asset Form Dialog */}
      <Dialog open={assetFormOpen} onOpenChange={setAssetFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit" : "Add"} Physical Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input
                id="asset-name"
                value={assetForm.name}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                placeholder="e.g., 2020 Honda Civic"
              />
            </div>
            <div>
              <Label htmlFor="asset-value">Estimated Value</Label>
              <Input
                id="asset-value"
                type="number"
                step="0.01"
                value={assetForm.value}
                onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleSaveAsset} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
