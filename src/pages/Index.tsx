import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { LiveClock } from '@/components/LiveClock';
import { WeekNavigator } from '@/components/WeekNavigator';
import { MilestoneButton } from '@/components/MilestoneButton';
import { TimelineView } from '@/components/TimelineView';
import { AddEntryForm } from '@/components/AddEntryForm';
import { TimePickerDialog } from '@/components/TimePickerDialog';
import { DaySummary } from '@/components/DaySummary';
import { WeeklyStats } from '@/components/WeeklyStats';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import { Activity } from 'lucide-react';

const Index = () => {
  const {
    selectedDate,
    setSelectedDate,
    getDayData,
    setWakeTime,
    setSleepTime,
    addEntry,
    deleteEntry,
  } = useTimeTracker();

  const [weekStart, setWeekStart] = useState(() => 
    startOfWeek(new Date(2025, 11, 27), { weekStartsOn: 6 }) // Saturday
  );
  
  const [timePickerType, setTimePickerType] = useState<'wake' | 'sleep' | null>(null);

  const dayData = getDayData(selectedDate);

  const handleSetMilestone = (type: 'wake' | 'sleep') => {
    setTimePickerType(type);
  };

  const handleConfirmTime = (time: Date) => {
    if (timePickerType === 'wake') {
      setWakeTime(selectedDate, time);
    } else if (timePickerType === 'sleep') {
      setSleepTime(selectedDate, time);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Energy Tracker</h1>
                <p className="text-sm text-muted-foreground">Track your daily energy</p>
              </div>
            </div>
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Week Navigator */}
        <WeekNavigator
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPreviousWeek={() => setWeekStart(subWeeks(weekStart, 1))}
          onNextWeek={() => setWeekStart(addWeeks(weekStart, 1))}
          weekStart={weekStart}
        />

        {/* Selected Date Header */}
        <div className="text-center py-2">
          <h2 className="text-2xl font-bold text-foreground">
            {format(selectedDate, 'EEEE')}
          </h2>
          <p className="text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 gap-4">
          <MilestoneButton
            type="wake"
            time={dayData.wakeTime}
            onSetTime={() => handleSetMilestone('wake')}
          />
          <MilestoneButton
            type="sleep"
            time={dayData.sleepTime}
            onSetTime={() => handleSetMilestone('sleep')}
          />
        </div>

        {/* Day Summary */}
        <DaySummary dayData={dayData} />

        {/* Add Entry Form */}
        <AddEntryForm
          selectedDate={selectedDate}
          onAddEntry={(entry) => addEntry(selectedDate, entry)}
        />

        {/* Timeline */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-lg text-foreground mb-4">Today's Timeline</h3>
          <TimelineView
            dayData={dayData}
            onDeleteEntry={(entryId) => deleteEntry(selectedDate, entryId)}
          />
        </div>

        {/* Weekly Stats */}
        <WeeklyStats weekStart={weekStart} getDayData={getDayData} />

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-energy-positive" />
            <span>Energizing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-energy-neutral" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-energy-negative" />
            <span>Draining</span>
          </div>
        </div>
      </main>

      {/* Time Picker Dialog */}
      <TimePickerDialog
        open={timePickerType !== null}
        onOpenChange={(open) => !open && setTimePickerType(null)}
        title={timePickerType === 'wake' ? 'Set wake time' : 'Set bedtime'}
        selectedDate={selectedDate}
        onConfirm={handleConfirmTime}
      />
    </div>
  );
};

export default Index;
