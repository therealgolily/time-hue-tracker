import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { PaymentScenario, FinancialEvent } from "../types";
import { EventForm } from "./EventForm";
import { EventTimeline } from "./EventTimeline";

interface EventBasedScenarioFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (scenario: Omit<PaymentScenario, "id">) => void;
}

export const EventBasedScenarioForm: React.FC<EventBasedScenarioFormProps> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [basePayment, setBasePayment] = useState("");
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [eventFormOpen, setEventFormOpen] = useState(false);

  const handleAddEvent = (event: Omit<FinancialEvent, "id">) => {
    const newEvent: FinancialEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    setEvents([...events, newEvent]);
    setEventFormOpen(false);
  };

  const handleRemoveEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scenario: Omit<PaymentScenario, "id"> = {
      name: name || "New Scenario",
      baseMonthlyPayment: parseFloat(basePayment) || 0,
      events: events,
    };

    onSave(scenario);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setBasePayment("");
    setEvents([]);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
            <DialogDescription>
              Build a timeline of financial events to model your debt payoff journey
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="scenarioName">Scenario Name</Label>
                <Input
                  id="scenarioName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Aggressive Q1 Push"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="basePayment">Base Monthly Payment ($)</Label>
                <Input
                  id="basePayment"
                  type="number"
                  step="0.01"
                  min="0"
                  value={basePayment}
                  onChange={(e) => setBasePayment(e.target.value)}
                  placeholder="1500.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Starting monthly payment amount before any events
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Timeline Events</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEventFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
                <EventTimeline events={events} onRemoveEvent={handleRemoveEvent} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">Calculate Scenario</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EventForm
        open={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        onSave={handleAddEvent}
      />
    </>
  );
};
