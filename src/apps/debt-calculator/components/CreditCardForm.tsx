import { useState, useEffect } from "react";
import { CreditCard } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditCardFormProps {
  card?: CreditCard;
  open: boolean;
  onClose: () => void;
  onSave: (card: Omit<CreditCard, "id"> | CreditCard) => void;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ card, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    apr: "",
    minimumPayment: "",
    monthlyPurchases: "",
    creditLimit: "",
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        balance: card.balance.toString(),
        apr: card.apr.toString(),
        minimumPayment: card.minimumPayment.toString(),
        monthlyPurchases: card.monthlyPurchases.toString(),
        creditLimit: card.creditLimit.toString(),
      });
    } else {
      setFormData({
        name: "",
        balance: "",
        apr: "",
        minimumPayment: "",
        monthlyPurchases: "",
        creditLimit: "",
      });
    }
  }, [card, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      name: formData.name,
      balance: parseFloat(formData.balance) || 0,
      apr: parseFloat(formData.apr) || 0,
      minimumPayment: parseFloat(formData.minimumPayment) || 0,
      monthlyPurchases: parseFloat(formData.monthlyPurchases) || 0,
      creditLimit: parseFloat(formData.creditLimit) || 0,
    };

    if (card) {
      onSave({ ...card, ...cardData });
    } else {
      onSave(cardData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{card ? "Edit Credit Card" : "Add Credit Card"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Card Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chase Sapphire"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apr">APR (%)</Label>
              <Input
                id="apr"
                type="number"
                step="0.01"
                value={formData.apr}
                onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                placeholder="18.99"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimumPayment">Minimum Payment</Label>
              <Input
                id="minimumPayment"
                type="number"
                step="0.01"
                value={formData.minimumPayment}
                onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                placeholder="25.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthlyPurchases">Estimated Monthly Purchases</Label>
              <Input
                id="monthlyPurchases"
                type="number"
                step="0.01"
                value={formData.monthlyPurchases}
                onChange={(e) => setFormData({ ...formData, monthlyPurchases: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="creditLimit">Credit Limit</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
