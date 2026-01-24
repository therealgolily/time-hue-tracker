import { useState, useEffect } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, formatDistanceToNow, isToday } from 'date-fns';
import { LiveClock } from '@/components/LiveClock';
import { WeekNavigator } from '@/components/WeekNavigator';
import { MilestoneButton } from '@/components/MilestoneButton';
import { TimelineView } from '@/components/TimelineView';
import { AddEntryForm } from '@/components/AddEntryForm';
import { TimePickerDialog } from '@/components/TimePickerDialog';
import { DaySummary } from '@/components/DaySummary';
import { WeeklyStats } from '@/components/WeeklyStats';
import { AuthForm } from '@/components/AuthForm';
import { LiveMode } from '@/components/LiveMode';
import { LiveEntryForm } from '@/components/LiveEntryForm';
import { CSVImportExport } from '@/components/CSVImportExport';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useCloudTimeTracker } from '@/hooks/useCloudTimeTracker';
import { useTheme } from '@/hooks/useTheme';
import { Check, LogOut, Cloud, Loader2, Zap, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntry, LiveSegment, EnergyLevel, Category, Client } from '@/types/timeTracker';
import { Link } from 'react-router-dom';

const EnergyTracker = () => {
  useTheme();
  
  const { user, loading: authLoading, signOut } = useAuth();

  const {
    selectedDate,
    setSelectedDate,
    getDayData,
    setWakeTime,
    setSleepTime,
    clearWakeTime,
    clearSleepTime,
    addEntry,
    deleteEntry,
    updateEntry,
    importEntries,
    data: allData,
    lastSaved,
    isLoading: dataLoading,
  } = useCloudTimeTracker(user?.id || null);

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 6 })
  );

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const newWeekStart = startOfWeek(date, { weekStartsOn: 6 });
    if (newWeekStart.getTime() !== weekStart.getTime()) {
      setWeekStart(newWeekStart);
    }
  };

  const [timePickerType, setTimePickerType] = useState<'wake' | 'sleep' | null>(null);
  const [liveModeActive, setLiveModeActive] = useState(false);
  const [liveSegments, setLiveSegments] = useState<LiveSegment[] | null>(null);

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

  const handleLiveModeComplete = (segments: LiveSegment[]) => {
    setLiveModeActive(false);
    setLiveSegments(segments);
  };

  const handleLiveEntrySubmit = (entries: Array<{
    startTime: Date;
    endTime: Date;
    description: string;
    energyLevel: EnergyLevel;
    category: Category;
    client?: Client;
    customClient?: string;
  }>) => {
    entries.forEach(entry => {
      addEntry(new Date(), entry);
    });
    setLiveSegments(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b-2 border-foreground">
          <div className="container max-w-2xl mx-auto px-6 py-4">
            <div className="text-center">
              <h1 className="text-lg font-bold uppercase tracking-widest">Energy Tracker</h1>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Track your daily energy</p>
            </div>
          </div>
        </header>
        <main className="container max-w-2xl mx-auto px-6 py-12">
          <AuthForm />
        </main>
      </div>
    );
  }

  if (liveModeActive) {
    return (
      <LiveMode
        selectedDate={new Date()}
        onComplete={handleLiveModeComplete}
        onCancel={() => setLiveModeActive(false)}
      />
    );
  }

  if (liveSegments) {
    return (
      <LiveEntryForm
        segments={liveSegments}
        onSubmit={handleLiveEntrySubmit}
        onCancel={() => setLiveSegments(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Swiss style */}
      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="container max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 -ml-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-sm font-bold uppercase tracking-widest">Energy</h1>
            </div>
            <div className="flex items-center gap-2">
              <LiveClock />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-6 py-8 space-y-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Live Mode Button - Swiss style */}
            <Button
              onClick={() => setLiveModeActive(true)}
              className="w-full h-14 text-sm font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <Zap className="w-4 h-4 mr-3" />
              Start Live Mode
            </Button>

            {/* Week Navigator */}
            <WeekNavigator
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPreviousWeek={() => setWeekStart(subWeeks(weekStart, 1))}
              onNextWeek={() => setWeekStart(addWeeks(weekStart, 1))}
              weekStart={weekStart}
              getDayData={getDayData}
            />

            {/* Selected Date Header */}
            <div className="text-center py-4 border-b-2 border-foreground">
              <h2 className="text-3xl font-bold uppercase tracking-tight">
                {format(selectedDate, 'EEEE')}
              </h2>
              <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mt-1">
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
              entries={dayData.entries}
              onAddEntry={(entry) => addEntry(selectedDate, entry)}
            />

            {/* Timeline */}
            <div className="border-2 border-foreground p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Timeline</h3>
              <TimelineView
                dayData={dayData}
                onDeleteEntry={(entryId) => deleteEntry(selectedDate, entryId)}
                onUpdateEntry={(entryId, updates) => updateEntry(selectedDate, entryId, updates)}
                onDeleteWakeTime={() => clearWakeTime(selectedDate)}
                onDeleteSleepTime={() => clearSleepTime(selectedDate)}
              />
            </div>

            {/* Weekly Stats */}
            <WeeklyStats weekStart={weekStart} getDayData={getDayData} />

            {/* CSV Import/Export */}
            <div className="border-2 border-foreground p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Import / Export</h3>
              <CSVImportExport
                getDayData={getDayData}
                allData={allData}
                onImportEntries={importEntries}
              />
            </div>

            {/* Legend - Swiss style */}
            <div className="flex justify-center gap-8 text-xs font-mono uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary" />
                <span>Energizing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground" />
                <span>Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-foreground" />
                <span>Draining</span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Time Picker Dialog */}
      <TimePickerDialog
        open={timePickerType !== null}
        onOpenChange={(open) => !open && setTimePickerType(null)}
        title={timePickerType === 'wake' ? 'Set wake time' : 'Set bedtime'}
        selectedDate={selectedDate}
        onConfirm={handleConfirmTime}
        wakeTime={dayData.wakeTime}
        isSleepTime={timePickerType === 'sleep'}
      />
    </div>
  );
};

export default EnergyTracker;