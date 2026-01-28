import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plane, Plus, Trash2, Edit2, X, Check, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTripExpenses, TripExpenseInput, TripExpense } from '../hooks/useTripExpenses';

const TripForm = ({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: TripExpense;
  onSubmit: (data: TripExpenseInput) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<TripExpenseInput>({
    trip_name: initialData?.trip_name || '',
    client_name: initialData?.client_name || '',
    start_date: initialData?.start_date || format(new Date(), 'yyyy-MM-dd'),
    end_date: initialData?.end_date || format(new Date(), 'yyyy-MM-dd'),
    purpose: initialData?.purpose || '',
    flights: initialData?.flights || 0,
    lodging: initialData?.lodging || 0,
    ground_transport: initialData?.ground_transport || 0,
    meals: initialData?.meals || 0,
    per_diem: initialData?.per_diem || 0,
    other_expenses: initialData?.other_expenses || 0,
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tripTotal =
    (formData.flights || 0) +
    (formData.lodging || 0) +
    (formData.ground_transport || 0) +
    (formData.meals || 0) +
    (formData.per_diem || 0) +
    (formData.other_expenses || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="trip_name">Trip Name *</Label>
          <Input
            id="trip_name"
            value={formData.trip_name}
            onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
            placeholder="e.g., Birmingham Client Onboarding"
            required
          />
        </div>

        <div>
          <Label htmlFor="client_name">Client Name</Label>
          <Input
            id="client_name"
            value={formData.client_name || ''}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            placeholder="Optional"
          />
        </div>

        <div>
          <Label htmlFor="purpose">Purpose</Label>
          <Input
            id="purpose"
            value={formData.purpose || ''}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="e.g., Onboarding, Training"
          />
        </div>

        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Expenses</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="flights" className="text-xs">Flights & Airfare</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="flights"
                type="number"
                value={formData.flights || ''}
                onChange={(e) => setFormData({ ...formData, flights: Number(e.target.value) || 0 })}
                className="pl-5"
                min={0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lodging" className="text-xs">Hotels & Lodging</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="lodging"
                type="number"
                value={formData.lodging || ''}
                onChange={(e) => setFormData({ ...formData, lodging: Number(e.target.value) || 0 })}
                className="pl-5"
                min={0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ground_transport" className="text-xs">Ground Transport</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="ground_transport"
                type="number"
                value={formData.ground_transport || ''}
                onChange={(e) => setFormData({ ...formData, ground_transport: Number(e.target.value) || 0 })}
                className="pl-5"
                min={0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="meals" className="text-xs">Meals (50% deductible)</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="meals"
                type="number"
                value={formData.meals || ''}
                onChange={(e) => setFormData({ ...formData, meals: Number(e.target.value) || 0 })}
                className="pl-5"
                min={0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="per_diem" className="text-xs">Per Diem</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="per_diem"
                type="number"
                value={formData.per_diem || ''}
                onChange={(e) => setFormData({ ...formData, per_diem: Number(e.target.value) || 0 })}
                className="pl-5"
                min={0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="other_expenses" className="text-xs">Other Expenses</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="other_expenses"
                type="number"
                value={formData.other_expenses || ''}
                onChange={(e) => setFormData({ ...formData, other_expenses: Number(e.target.value) || 0 })}
                className="pl-5"
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional details..."
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-sm">
          <span className="text-muted-foreground">Trip Total: </span>
          <span className="font-bold text-foreground">${tripTotal.toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Trip' : 'Add Trip'}
          </Button>
        </div>
      </div>
    </form>
  );
};

interface TripExpenseTrackerProps {
  onTotalsChange?: (totals: ReturnType<typeof useTripExpenses>['totals']) => void;
}

export const TripExpenseTracker = ({ onTotalsChange }: TripExpenseTrackerProps) => {
  const { trips, loading, addTrip, updateTrip, deleteTrip, totals } = useTripExpenses();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripExpense | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Notify parent of totals changes
  useEffect(() => {
    if (onTotalsChange && !loading) {
      onTotalsChange(totals);
    }
  }, [totals, onTotalsChange, loading]);

  const handleAddTrip = async (data: TripExpenseInput) => {
    await addTrip(data);
    setIsAddOpen(false);
  };

  const handleUpdateTrip = async (data: TripExpenseInput) => {
    if (editingTrip) {
      await updateTrip(editingTrip.id, data);
      setEditingTrip(null);
    }
  };

  const getTripTotal = (trip: TripExpense) => {
    return (
      Number(trip.flights) +
      Number(trip.lodging) +
      Number(trip.ground_transport) +
      Number(trip.meals) +
      Number(trip.per_diem) +
      Number(trip.other_expenses)
    );
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <div className="text-muted-foreground">Loading trip expenses...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Business Travel Tracker</h2>
              <p className="text-sm text-muted-foreground">
                Log trips to auto-calculate travel deductions
              </p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Business Trip</DialogTitle>
              </DialogHeader>
              <TripForm
                onSubmit={handleAddTrip}
                onCancel={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Totals */}
      {totals.tripCount > 0 && (
        <div className="p-4 bg-muted/30 border-b border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total Trips</p>
              <p className="text-lg font-bold text-foreground">{totals.tripCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Total Spent</p>
              <p className="text-lg font-bold text-foreground">${totals.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tax Deductible</p>
              <p className="text-lg font-bold text-success">${totals.totalDeductible.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Meals (50%)</p>
              <p className="text-lg font-bold text-foreground">
                ${totals.meals.toLocaleString()} → ${totals.mealsDeductible.toLocaleString()}
              </p>
            </div>
          </div>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Breakdown
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Breakdown
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3 pt-3 border-t border-border/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Flights</p>
                  <p className="font-semibold">${totals.flights.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Lodging</p>
                  <p className="font-semibold">${totals.lodging.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Transport</p>
                  <p className="font-semibold">${totals.groundTransport.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Meals</p>
                  <p className="font-semibold">${totals.meals.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Per Diem</p>
                  <p className="font-semibold">${totals.perDiem.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Other</p>
                  <p className="font-semibold">${totals.otherExpenses.toLocaleString()}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Trip List */}
      <div className="divide-y divide-border/30">
        {trips.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No trips logged yet</p>
            <p className="text-sm">Add your first business trip to start tracking</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{trip.trip_name}</h4>
                    {trip.client_name && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {trip.client_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </span>
                    {trip.purpose && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.purpose}
                      </span>
                    )}
                  </div>
                  {trip.notes && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{trip.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-bold text-foreground">${getTripTotal(trip).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">total</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingTrip(trip)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteTrip(trip.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTrip} onOpenChange={() => setEditingTrip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          {editingTrip && (
            <TripForm
              initialData={editingTrip}
              onSubmit={handleUpdateTrip}
              onCancel={() => setEditingTrip(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tax Integration Note */}
      {totals.tripCount > 0 && (
        <div className="p-4 bg-primary/5 border-t border-primary/20">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Tax Deduction Summary</p>
              <p className="text-muted-foreground">
                Use these totals in your Tax Deductions above: Flights ${totals.flights.toLocaleString()}, 
                Lodging ${totals.lodging.toLocaleString()}, Ground Transport ${totals.groundTransport.toLocaleString()}, 
                Travel Meals ${totals.meals.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
