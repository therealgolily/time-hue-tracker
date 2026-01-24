import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, formatDistanceToNow } from 'date-fns';
import { LiveClock } from '@/components/LiveClock';
import { ClientTrackerWeekNavigator } from '@/components/ClientTrackerWeekNavigator';
import { MilestoneButton } from '@/components/MilestoneButton';
import { ClientTrackerTimelineView } from '@/components/ClientTrackerTimelineView';
import { ClientTrackerAddEntryForm } from '@/components/ClientTrackerAddEntryForm';
import { TimePickerDialog } from '@/components/TimePickerDialog';
import { ClientTrackerDaySummary } from '@/components/ClientTrackerDaySummary';
import { ClientTrackerWeeklyStats } from '@/components/ClientTrackerWeeklyStats';
import { AuthForm } from '@/components/AuthForm';
import { ClientTrackerLiveMode } from '@/components/ClientTrackerLiveMode';
import { ClientTrackerLiveEntryForm } from '@/components/ClientTrackerLiveEntryForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useCloudClientTracker } from '@/hooks/useCloudClientTracker';
import { useTheme } from '@/hooks/useTheme';
import { Building2, Check, LogOut, Cloud, Loader2, Zap, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientLiveSegment, TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { Link } from 'react-router-dom';

const ClientTracker = () => {
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
    data: allData,
    lastSaved,
    isLoading: dataLoading,
  } = useCloudClientTracker(user?.id || null);

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
  const [liveSegments, setLiveSegments] = useState<ClientLiveSegment[] | null>(null);

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

  const handleLiveModeComplete = (segments: ClientLiveSegment[]) => {
    setLiveModeActive(false);
    setLiveSegments(segments);
  };

  const handleLiveEntrySubmit = (entries: Array<{
    startTime: Date;
    endTime: Date;
    description: string;
    trackerClient: TrackerClient;
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
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Client Tracker</h1>
                <p className="text-sm text-muted-foreground">Track your client work</p>
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

  if (liveModeActive) {
    return (
      <ClientTrackerLiveMode
        selectedDate={new Date()}
        onComplete={handleLiveModeComplete}
        onCancel={() => setLiveModeActive(false)}
      />
    );
  }

  if (liveSegments) {
    return (
      <ClientTrackerLiveEntryForm
        segments={liveSegments}
        onSubmit={handleLiveEntrySubmit}
        onCancel={() => setLiveSegments(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                title="Back to Home"
              >
                <Home className="w-5 h-5 text-primary" />
              </Link>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Client Tracker</h1>
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
            <Button
              onClick={() => setLiveModeActive(true)}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Live Mode
            </Button>

            <ClientTrackerWeekNavigator
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPreviousWeek={() => setWeekStart(subWeeks(weekStart, 1))}
              onNextWeek={() => setWeekStart(addWeeks(weekStart, 1))}
              weekStart={weekStart}
              getDayData={getDayData}
            />

            <div className="text-center py-2">
              <h2 className="text-2xl font-bold text-foreground">
                {format(selectedDate, 'EEEE')}
              </h2>
              <p className="text-muted-foreground">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>

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

            <ClientTrackerDaySummary dayData={dayData} />

            <ClientTrackerAddEntryForm
              selectedDate={selectedDate}
              entries={dayData.entries}
              onAddEntry={(entry) => addEntry(selectedDate, entry)}
            />

            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-4">Today's Timeline</h3>
              <ClientTrackerTimelineView
                dayData={dayData}
                onDeleteEntry={(entryId) => deleteEntry(selectedDate, entryId)}
                onUpdateEntry={(entryId, updates) => updateEntry(selectedDate, entryId, updates)}
                onDeleteWakeTime={() => clearWakeTime(selectedDate)}
                onDeleteSleepTime={() => clearSleepTime(selectedDate)}
              />
            </div>

            <ClientTrackerWeeklyStats weekStart={weekStart} getDayData={getDayData} />

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {(Object.keys(TRACKER_CLIENT_LABELS) as TrackerClient[]).slice(0, 6).map(client => (
                <div key={client} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    client === 'rosser-results' ? 'bg-violet-500' :
                    client === 'carolinas' ? 'bg-blue-500' :
                    client === 'richmond' ? 'bg-emerald-500' :
                    client === 'memphis' ? 'bg-amber-500' :
                    client === 'tri-cities' ? 'bg-rose-500' :
                    'bg-cyan-500'
                  }`} />
                  <span>{TRACKER_CLIENT_LABELS[client]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

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

export default ClientTracker;
