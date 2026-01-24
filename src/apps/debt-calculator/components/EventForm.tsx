import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialEvent, FinancialEventType } from "../types";
import { useFinance } from "../context/FinanceContext";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<FinancialEvent, "id">) => void;
}

const EVENT_TYPE_CONFIG: Record<FinancialEventType, { label: string; icon: string; color: string }> = {
  payment_change: { label: "💰 Change Payment Amount", icon: "💰", color: "text-blue-600" },
  income_start: { label: "💼 New Income Starts", icon: "💼", color: "text-green-600" },
  income_end: { label: "⛔ Income Ends", icon: "⛔", color: "text-red-600" },
  expense_start: { label: "📉 New Expense Starts", icon: "📉", color: "text-red-600" },
  expense_end: { label: "✅ Expense Ends", icon: "✅", color: "text-green-600" },
  asset_sale: { label: "💻 Sell Asset", icon: "💻", color: "text-purple-600" },
  windfall: { label: "💸 One-Time Windfall", icon: "💸", color: "text-green-600" },
  one_time_expense: { label: "⚠️ One-Time Expense", icon: "⚠️", color: "text-orange-600" },
};

export const EventForm: React.FC<EventFormProps> = ({ open, onClose, onSave }) => {
  const { data } = useFinance();
  const [eventType, setEventType] = useState<FinancialEventType>("payment_change");
  const [startMonth, setStartMonth] = useState("1");
  const [endMonth, setEndMonth] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [assetId, setAssetId] = useState("");
  const [ongoing, setOngoing] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const asset = assetId ? data.physicalAssets.find(a => a.id === assetId) : undefined;
    
    const event: Omit<FinancialEvent, "id"> = {
      type: eventType,
      startMonth: parseInt(startMonth),
      endMonth: ongoing ? undefined : (endMonth ? parseInt(endMonth) : undefined),
      description: description || getDefaultDescription(),
      amount: parseFloat(amount) || 0,
      assetId: assetId || undefined,
      icon: EVENT_TYPE_CONFIG[eventType].icon,
    };

    onSave(event);
    resetForm();
  };

  const resetForm = () => {
    setEventType("payment_change");
    setStartMonth("1");
    setEndMonth("");
    setDescription("");
    setAmount("");
    setAssetId("");
    setOngoing(true);
    onClose();
  };

  const getDefaultDescription = () => {
    switch (eventType) {
      case "payment_change": return "Payment adjustment";
      case "income_start": return "New income source";
      case "income_end": return "Income ends";
      case "expense_start": return "New expense";
      case "expense_end": return "Expense ends";
      case "asset_sale": return data.physicalAssets.find(a => a.id === assetId)?.name || "Asset sale";
      case "windfall": return "Windfall payment";
      case "one_time_expense": return "One-time expense";
      default: return "Financial event";
    }
  };

  const handleAssetChange = (selectedAssetId: string) => {
    setAssetId(selectedAssetId);
    const asset = data.physicalAssets.find(a => a.id === selectedAssetId);
    if (asset) {
      setAmount(asset.value.toString());
      setDescription(`Sell ${asset.name}`);
    }
  };

  const needsEndMonth = eventType === "income_start" || eventType === "expense_start";
  const isAssetSale = eventType === "asset_sale";

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Financial Event</DialogTitle>
          <DialogDescription>
            Add an event to your scenario timeline
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as FinancialEventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <span className={config.color}>{config.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startMonth">Starting Month</Label>
              <Input
                id="startMonth"
                type="number"
                min="1"
                max="60"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Month 1 = Current month</p>
            </div>

            {needsEndMonth && (
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ongoing"
                    checked={ongoing}
                    onChange={(e) => setOngoing(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="ongoing" className="font-normal cursor-pointer text-sm">
                    Ongoing (no end date)
                  </Label>
                </div>
                {!ongoing && (
                  <>
                    <Label htmlFor="endMonth">Ending Month</Label>
                    <Input
                      id="endMonth"
                      type="number"
                      min={parseInt(startMonth) + 1}
                      max="60"
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                    />
                  </>
                )}
              </div>
            )}

            {isAssetSale && data.physicalAssets.length > 0 ? (
              <div className="grid gap-2">
                <Label>Select Asset</Label>
                <Select value={assetId} onValueChange={handleAssetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose asset to sell" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.physicalAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} (${asset.value.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : isAssetSale ? (
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">No physical assets available. Add assets in the Assets tab first.</p>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={getDefaultDescription()}
              />
            </div>

            {!isAssetSale && (
              <div className="grid gap-2">
                <Label htmlFor="amount">
                  {eventType === "payment_change" ? "New Monthly Payment ($)" : "Amount ($)"}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            )}

            {isAssetSale && assetId && (
              <div className="grid gap-2">
                <Label htmlFor="amount">Sale Price ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Pre-filled with asset value, adjust if needed</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Add Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
