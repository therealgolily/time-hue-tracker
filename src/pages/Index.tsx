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
import { Activity, Check, LogOut, Cloud, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntry, LiveSegment, EnergyLevel, Category, Client } from '@/types/timeTracker';

const Index = () => {
  // Initialize theme
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
    startOfWeek(new Date(2025, 11, 27), { weekStartsOn: 6 }) // Saturday
  );

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
    // Add each entry
    entries.forEach(entry => {
      addEntry(new Date(), entry);
    });
    setLiveSegments(null);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Energy Tracker</h1>
                <p className="text-sm text-muted-foreground">Track your daily energy</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container max-w-2xl mx-auto px-4 py-12">
          <AuthForm />
        </main>
      </div>
    );
  }

  // Show Live Mode
  if (liveModeActive) {
    return (
      <LiveMode
        selectedDate={new Date()}
        onComplete={handleLiveModeComplete}
        onCancel={() => setLiveModeActive(false)}
      />
    );
  }

  // Show Live Entry Form after timer completes
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cloud className="w-3 h-3 text-primary" />
                  {lastSaved ? (
                    <>
                      <Check className="w-3 h-3 text-energy-positive" />
                      <span>Synced {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
                    </>
                  ) : (
                    <span>Cloud sync enabled</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LiveClock />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Live Mode Button */}
            <Button
              onClick={() => setLiveModeActive(true)}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Live Mode
            </Button>

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
                onUpdateEntry={(entryId, updates) => updateEntry(selectedDate, entryId, updates)}
                onDeleteWakeTime={() => clearWakeTime(selectedDate)}
                onDeleteSleepTime={() => clearSleepTime(selectedDate)}
              />
            </div>

            {/* Weekly Stats */}
            <WeeklyStats weekStart={weekStart} getDayData={getDayData} />

            {/* CSV Import/Export */}
            <div className="glass-card p-4">
              <h3 className="font-semibold text-foreground mb-3">Import / Export</h3>
              <CSVImportExport
                getDayData={getDayData}
                allData={allData}
                onImportEntries={importEntries}
              />
            </div>

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

export default Index;
