import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar, TrendingUp, Repeat } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { ExpectedIncome } from "../types";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const ExpectedIncomeSection = () => {
  const { data, addExpectedIncome, updateExpectedIncome, deleteExpectedIncome } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpectedIncome | null>(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date(),
    isRecurring: false,
  });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const totalCurrentMonth = data.expectedIncome
    .filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    })
    .reduce((sum, income) => sum + income.amount, 0);

  const next3Months = data.expectedIncome
    .filter(income => {
      const incomeDate = new Date(income.date);
      const monthsDiff = (incomeDate.getFullYear() - currentYear) * 12 + (incomeDate.getMonth() - currentMonth);
      return monthsDiff >= 0 && monthsDiff <= 2;
    })
    .reduce((sum, income) => sum + income.amount + (income.isRecurring ? income.amount * 2 : 0), 0);

  const handleSave = () => {
    const incomeData = {
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      date: form.date,
      isRecurring: form.isRecurring,
    };

    if (editing) {
      updateExpectedIncome(editing.id, incomeData);
    } else {
      addExpectedIncome(incomeData);
    }
    
    setFormOpen(false);
    setEditing(null);
    setForm({ description: "", amount: "", date: new Date(), isRecurring: false });
  };

  const openEdit = (income: ExpectedIncome) => {
    setEditing(income);
    setForm({
      description: income.description,
      amount: income.amount.toString(),
      date: new Date(income.date),
      isRecurring: income.isRecurring,
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ description: "", amount: "", date: new Date(), isRecurring: false });
    setFormOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Expected Income Schedule
          </CardTitle>
          <Button onClick={openNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current Month:</p>
            <p className="text-xl font-bold text-positive">${totalCurrentMonth.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Next 3 Months:</p>
            <p className="text-xl font-bold text-positive">${next3Months.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.expectedIncome.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No expected income scheduled</p>
          ) : (
            data.expectedIncome
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{income.description}</p>
                      {income.isRecurring && (
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(income.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-positive">${income.amount.toFixed(2)}</p>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(income)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteExpectedIncome(income.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Expected Income</DialogTitle>
            <DialogDescription>
              Track expected payments and income to better plan your finances
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g., Client Payment"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Expected Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={form.date}
                    onSelect={(date) => date && setForm({ ...form, date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={form.isRecurring}
                onCheckedChange={(checked) => setForm({ ...form, isRecurring: checked as boolean })}
              />
              <Label htmlFor="recurring" className="cursor-pointer">
                Recurring monthly payment
              </Label>
            </div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
