import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Timer, Pencil, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/types/calendar';
import { useCountdowns } from '@/hooks/useCountdowns';
import { CountdownModal } from './CountdownModal';
import { cn } from '@/lib/utils';

interface CountdownPanelProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export const CountdownPanel = ({ onOpenChange }: CountdownPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<Countdown | undefined>();
  const [showPassed, setShowPassed] = useState(false);

  const {
    countdowns,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    getDurationRemaining,
    getCountdownStatus,
  } = useCountdowns();

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleAddNew = () => {
    setEditingCountdown(undefined);
    setModalOpen(true);
  };

  const handleEdit = (countdown: Countdown) => {
    setEditingCountdown(countdown);
    setModalOpen(true);
  };

  const handleSave = (data: { title: string; targetDate: string }) => {
    if (editingCountdown) {
      updateCountdown(editingCountdown.id, data);
    } else {
      addCountdown(data);
    }
  };

  const upcomingCountdowns = countdowns.filter(c => getCountdownStatus(c.targetDate) !== 'passed');
  const passedCountdowns = countdowns.filter(c => getCountdownStatus(c.targetDate) === 'passed');

  const renderCountdownItem = (countdown: Countdown) => {
    const duration = getDurationRemaining(countdown.targetDate);
    const status = getCountdownStatus(countdown.targetDate);

    const renderDuration = () => {
      if (duration.totalDays <= 0) return null;
      
      // If over a year, show years, months, days
      if (duration.years > 0) {
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-baseline gap-2 justify-center flex-wrap">
              <div>
                <span className="text-2xl font-black">{duration.years}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest ml-1">
                  {duration.years === 1 ? 'yr' : 'yrs'}
                </span>
              </div>
              <div>
                <span className="text-2xl font-black">{duration.months}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest ml-1">
                  {duration.months === 1 ? 'mo' : 'mos'}
                </span>
              </div>
              <div>
                <span className="text-2xl font-black">{duration.days}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest ml-1">
                  {duration.days === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          </div>
        );
      }
      
      // If over a month but less than a year, show months and days
      if (duration.months > 0) {
        return (
          <div className="flex items-baseline gap-2 justify-center">
            <div>
              <span className="text-2xl font-black">{duration.months}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest ml-1">
                {duration.months === 1 ? 'mo' : 'mos'}
              </span>
            </div>
            <div>
              <span className="text-2xl font-black">{duration.days}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest ml-1">
                {duration.days === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        );
      }
      
      // Less than a month, just show days
      return (
        <div>
          <span className="text-3xl font-black">{duration.totalDays}</span>
          <span className="text-xs font-mono uppercase tracking-widest ml-2">
            {duration.totalDays === 1 ? 'day' : 'days'}
          </span>
        </div>
      );
    };

    return (
      <div
        key={countdown.id}
        className={cn(
          'border-2 border-foreground p-3 group transition-colors',
          status === 'today' && 'bg-primary text-primary-foreground',
          status === 'passed' && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm uppercase tracking-wide truncate">
              {countdown.title}
            </h4>
            <p className={cn(
              "text-xs font-mono mt-1",
              status === 'today' ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}>
              {format(parseISO(countdown.targetDate), 'MMM d, yyyy')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(countdown)}
            className={cn(
              'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
              status === 'today' && 'hover:bg-primary-foreground/20'
            )}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-3 text-center">
          {status === 'today' ? (
            <div className="text-2xl font-black uppercase tracking-widest">
              Today!
            </div>
          ) : status === 'passed' ? (
            <div className="text-lg font-bold text-muted-foreground">
              Passed
            </div>
          ) : (
            renderDuration()
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button (visible when panel is closed) */}
      {!isOpen && (
        <button
          onClick={() => handleToggle(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-foreground text-background p-2 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <Timer className="h-5 w-5 mt-1" />
        </button>
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full bg-background border-l-2 border-foreground z-40 transition-transform duration-300 flex flex-col',
          'w-72',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Countdowns</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggle(false)}
            className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Button */}
        <div className="p-4 border-b-2 border-foreground">
          <Button
            onClick={handleAddNew}
            className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground border-2 border-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Countdown
          </Button>
        </div>

        {/* Countdowns List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {upcomingCountdowns.length === 0 && passedCountdowns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-mono uppercase tracking-widest">No countdowns</p>
              <p className="text-xs mt-1">Add one above</p>
            </div>
          ) : (
            <>
              {upcomingCountdowns.map(renderCountdownItem)}

              {/* Passed Countdowns Section */}
              {passedCountdowns.length > 0 && (
                <div className="pt-4">
                  <button
                    onClick={() => setShowPassed(!showPassed)}
                    className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    <span>Passed ({passedCountdowns.length})</span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        showPassed && 'rotate-90'
                      )}
                    />
                  </button>
                  
                  {showPassed && (
                    <div className="space-y-3 mt-2">
                      {passedCountdowns.map(renderCountdownItem)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <CountdownModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        existingCountdown={editingCountdown}
        onSave={handleSave}
        onDelete={deleteCountdown}
      />
    </>
  );
};

// Export hook for use in other components
export { useCountdowns } from '@/hooks/useCountdowns';
