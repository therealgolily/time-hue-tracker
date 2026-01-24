import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, DollarSign, Wallet, Home } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { CheckingAccount, SavingsAccount, PhysicalAsset } from "../types";

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

  const totalChecking = data.checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalSavings = data.savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPhysical = data.physicalAssets.reduce((sum, asset) => sum + asset.value, 0);

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
      {/* Checking Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Checking Accounts
            </h2>
            <p className="text-muted-foreground">
              Total: <span className="font-semibold text-positive">${totalChecking.toFixed(2)}</span>
            </p>
          </div>
          <Button onClick={() => { setEditingChecking(null); setCheckingForm({ name: "", balance: "" }); setCheckingFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.checkingAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{account.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-positive mb-3">${account.balance.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditChecking(account)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteCheckingAccount(account.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Savings Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Savings Accounts
            </h2>
            <p className="text-muted-foreground">
              Total: <span className="font-semibold text-positive">${totalSavings.toFixed(2)}</span>
            </p>
          </div>
          <Button onClick={() => { setEditingSavings(null); setSavingsForm({ name: "", balance: "" }); setSavingsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.savingsAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{account.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-positive mb-3">${account.balance.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditSavings(account)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteSavingsAccount(account.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Physical Assets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Home className="h-6 w-6" />
              Physical Assets
            </h2>
            <p className="text-muted-foreground">
              Total: <span className="font-semibold text-positive">${totalPhysical.toFixed(2)}</span>
            </p>
          </div>
          <Button onClick={() => { setEditingAsset(null); setAssetForm({ name: "", value: "" }); setAssetFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.physicalAssets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-positive mb-3">${asset.value.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditAsset(asset)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deletePhysicalAsset(asset.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
