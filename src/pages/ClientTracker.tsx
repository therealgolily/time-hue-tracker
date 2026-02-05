import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, formatDistanceToNow } from 'date-fns';
import { LiveClock } from '@/components/LiveClock';
import { ClientTrackerWeekNavigator } from '@/components/ClientTrackerWeekNavigator';
import { MilestoneButton } from '@/components/MilestoneButton';
import { ClockInOutButton } from '@/components/ClockInOutButton';
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
import { Check, LogOut, Loader2, Zap, ArrowLeft, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
    setClockInTime,
    setClockOutTime,
    clearClockInTime,
    clearClockOutTime,
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

  const [timePickerType, setTimePickerType] = useState<'wake' | 'sleep' | 'clock-in' | 'clock-out' | null>(null);
  const [liveModeActive, setLiveModeActive] = useState(false);
  const [liveSegments, setLiveSegments] = useState<ClientLiveSegment[] | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(true);

  const dayData = getDayData(selectedDate);

  const handleSetMilestone = (type: 'wake' | 'sleep' | 'clock-in' | 'clock-out') => {
    setTimePickerType(type);
  };

  const handleConfirmTime = (time: Date) => {
    if (timePickerType === 'wake') {
      setWakeTime(selectedDate, time);
    } else if (timePickerType === 'sleep') {
      setSleepTime(selectedDate, time);
    } else if (timePickerType === 'clock-in') {
      setClockInTime(selectedDate, time);
    } else if (timePickerType === 'clock-out') {
      setClockOutTime(selectedDate, time);
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
              <h1 className="text-lg font-bold uppercase tracking-widest">Client Tracker</h1>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Track your client work</p>
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
              <h1 className="text-sm font-bold uppercase tracking-widest">Work Time Tracker</h1>
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

            <ClientTrackerAddEntryForm
              selectedDate={selectedDate}
              entries={dayData.entries}
              onAddEntry={(entry) => addEntry(selectedDate, entry)}
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

            {/* Clock In/Out */}
            <div className="grid grid-cols-2 gap-4">
              <ClockInOutButton
                type="clock-in"
                time={dayData.clockInTime}
                onSetTime={() => handleSetMilestone('clock-in')}
                onSetNow={() => setClockInTime(selectedDate, new Date())}
                onClearTime={() => clearClockInTime(selectedDate)}
              />
              <ClockInOutButton
                type="clock-out"
                time={dayData.clockOutTime}
                onSetTime={() => handleSetMilestone('clock-out')}
                onSetNow={() => setClockOutTime(selectedDate, new Date())}
                onClearTime={() => clearClockOutTime(selectedDate)}
              />
            </div>

            <ClientTrackerDaySummary dayData={dayData} />

            <ClientTrackerWeekNavigator
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPreviousWeek={() => setWeekStart(subWeeks(weekStart, 1))}
              onNextWeek={() => setWeekStart(addWeeks(weekStart, 1))}
              weekStart={weekStart}
              getDayData={getDayData}
            />

            <Collapsible open={timelineOpen} onOpenChange={setTimelineOpen}>
              <div className="border-2 border-foreground">
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-widest">Timeline</h3>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${timelineOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <ClientTrackerTimelineView
                    dayData={dayData}
                    onDeleteEntry={(entryId) => deleteEntry(selectedDate, entryId)}
                    onUpdateEntry={(entryId, updates) => updateEntry(selectedDate, entryId, updates)}
                    onDeleteWakeTime={() => clearWakeTime(selectedDate)}
                    onDeleteSleepTime={() => clearSleepTime(selectedDate)}
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>

            <ClientTrackerWeeklyStats weekStart={weekStart} getDayData={getDayData} />

            {/* Legend - Swiss style */}
            <div className="flex flex-wrap justify-center gap-6 text-xs font-mono uppercase tracking-widest">
              {(Object.keys(TRACKER_CLIENT_LABELS) as TrackerClient[]).slice(0, 6).map((client, index) => (
                <div key={client} className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${
                    index === 0 ? 'bg-primary' :
                    index % 2 === 0 ? 'bg-foreground' :
                    'bg-muted-foreground'
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
        title={
          timePickerType === 'wake' ? 'Set wake time' : 
          timePickerType === 'sleep' ? 'Set bedtime' :
          timePickerType === 'clock-in' ? 'Set clock in time' :
          'Set clock out time'
        }
        selectedDate={selectedDate}
        onConfirm={handleConfirmTime}
        wakeTime={dayData.wakeTime}
        isSleepTime={timePickerType === 'sleep' || timePickerType === 'clock-out'}
      />
    </div>
  );
};

export default ClientTracker;