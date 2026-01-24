import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calendar, AlertCircle, CreditCard } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { OtherDebt } from "../types";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const OtherDebtsSection = () => {
  const { data, addOtherDebt, updateOtherDebt, deleteOtherDebt } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OtherDebt | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: "payment_plan" | "lump_sum";
    amount: string;
    monthlyPayment: string;
    paymentsRemaining: string;
    interestRate: string;
    dueDate: Date | undefined;
    settingAsideMonthly: boolean;
    monthlySetAside: string;
  }>({
    name: "",
    type: "payment_plan",
    amount: "",
    monthlyPayment: "",
    paymentsRemaining: "",
    interestRate: "0",
    dueDate: undefined,
    settingAsideMonthly: false,
    monthlySetAside: "",
  });

  const totalPaymentPlanDebt = data.otherDebts
    .filter(d => d.type === "payment_plan")
    .reduce((sum, d) => sum + d.amount, 0);
  
  const totalLumpSumDebt = data.otherDebts
    .filter(d => d.type === "lump_sum")
    .reduce((sum, d) => sum + d.amount, 0);
  
  const totalMonthlyPayments = data.otherDebts
    .filter(d => d.type === "payment_plan")
    .reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);

  const handleSave = () => {
    const debtData: Omit<OtherDebt, "id"> = {
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount) || 0,
      ...(form.type === "payment_plan" && {
        monthlyPayment: parseFloat(form.monthlyPayment) || 0,
        paymentsRemaining: parseInt(form.paymentsRemaining) || 0,
        interestRate: parseFloat(form.interestRate) || 0,
      }),
      ...(form.type === "lump_sum" && {
        dueDate: form.dueDate,
        settingAsideMonthly: form.settingAsideMonthly,
        monthlySetAside: form.settingAsideMonthly ? parseFloat(form.monthlySetAside) || 0 : undefined,
      }),
    };

    if (editing) {
      updateOtherDebt(editing.id, debtData);
    } else {
      addOtherDebt(debtData);
    }
    
    setFormOpen(false);
    setEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "payment_plan",
      amount: "",
      monthlyPayment: "",
      paymentsRemaining: "",
      interestRate: "0",
      dueDate: undefined,
      settingAsideMonthly: false,
      monthlySetAside: "",
    });
  };

  const openEdit = (debt: OtherDebt) => {
    setEditing(debt);
    setForm({
      name: debt.name,
      type: debt.type,
      amount: debt.amount.toString(),
      monthlyPayment: debt.monthlyPayment?.toString() || "",
      paymentsRemaining: debt.paymentsRemaining?.toString() || "",
      interestRate: debt.interestRate?.toString() || "0",
      dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
      settingAsideMonthly: debt.settingAsideMonthly || false,
      monthlySetAside: debt.monthlySetAside?.toString() || "",
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    resetForm();
    setFormOpen(true);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Other Debts & Obligations
          </CardTitle>
          <Button onClick={openNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Debt
          </Button>
        </div>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Payment Plans:</p>
            <p className="text-xl font-bold text-destructive">${totalPaymentPlanDebt.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">${totalMonthlyPayments.toFixed(2)}/month</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lump Sum Due:</p>
            <p className="text-xl font-bold text-destructive">${totalLumpSumDebt.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.otherDebts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No other debts added</p>
          ) : (
            data.otherDebts.map((debt) => {
              const isDueSoon = debt.type === "lump_sum" && debt.dueDate && getDaysUntilDue(debt.dueDate) <= 30;
              
              return (
                <div key={debt.id} className={cn("flex items-center justify-between p-3 border rounded-lg", isDueSoon && "border-destructive bg-destructive/5")}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{debt.name}</p>
                      <Badge variant={debt.type === "payment_plan" ? "secondary" : "outline"}>
                        {debt.type === "payment_plan" ? "Payment Plan" : "Lump Sum"}
                      </Badge>
                      {isDueSoon && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {debt.type === "payment_plan" ? (
                        <span>${debt.monthlyPayment?.toFixed(2)}/month × {debt.paymentsRemaining} payments{debt.interestRate && debt.interestRate > 0 ? ` at ${debt.interestRate}% APR` : ""}</span>
                      ) : (
                        <>
                          {debt.dueDate && (
                            <span>
                              Due: {format(new Date(debt.dueDate), "MMM d, yyyy")}
                              {" "}({getDaysUntilDue(debt.dueDate)} days)
                            </span>
                          )}
                          {debt.settingAsideMonthly && debt.monthlySetAside && (
                            <span className="ml-2 text-positive">
                              (Setting aside ${debt.monthlySetAside.toFixed(2)}/month)
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-destructive">${debt.amount.toFixed(2)}</p>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(debt)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteOtherDebt(debt.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Other Debt</DialogTitle>
            <DialogDescription>
              Track payment plans, taxes, equipment purchases, and other financial obligations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Debt Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Website Payment Plan"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Debt Type</Label>
              <Select value={form.type} onValueChange={(value: "payment_plan" | "lump_sum") => setForm({ ...form, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_plan">Payment Plan (Monthly Payments)</SelectItem>
                  <SelectItem value="lump_sum">Lump Sum (One-Time Payment)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Total Amount Owed</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {form.type === "payment_plan" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                    <Input
                      id="monthlyPayment"
                      type="number"
                      step="0.01"
                      value={form.monthlyPayment}
                      onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentsRemaining">Payments Remaining</Label>
                    <Input
                      id="paymentsRemaining"
                      type="number"
                      value={form.paymentsRemaining}
                      onChange={(e) => setForm({ ...form, paymentsRemaining: e.target.value })}
                      placeholder="12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="interestRate">Interest Rate (APR %)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={form.interestRate}
                    onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}

            {form.type === "lump_sum" && (
              <>
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.dueDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {form.dueDate ? format(form.dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={form.dueDate}
                        onSelect={(date) => date && setForm({ ...form, dueDate: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="settingAside"
                      checked={form.settingAsideMonthly}
                      onCheckedChange={(checked) => setForm({ ...form, settingAsideMonthly: checked as boolean })}
                    />
                    <Label htmlFor="settingAside" className="cursor-pointer">
                      Setting aside money monthly for this payment
                    </Label>
                  </div>
                  {form.settingAsideMonthly && (
                    <div>
                      <Label htmlFor="monthlySetAside">Monthly Amount to Set Aside</Label>
                      <Input
                        id="monthlySetAside"
                        type="number"
                        step="0.01"
                        value={form.monthlySetAside}
                        onChange={(e) => setForm({ ...form, monthlySetAside: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
