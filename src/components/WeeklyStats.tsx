import { useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { DayData, CLIENT_LABELS, Client } from '@/types/timeTracker';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Briefcase, User, Clock } from 'lucide-react';

interface WeeklyStatsProps {
  weekStart: Date;
  getDayData: (date: Date) => DayData;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const COLORS = {
  work: 'hsl(var(--accent))',
  personal: 'hsl(var(--primary))',
};

const CLIENT_COLORS = [
  'hsl(210, 70%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(280, 60%, 55%)',
  'hsl(350, 65%, 55%)',
  'hsl(45, 85%, 50%)',
  'hsl(190, 70%, 45%)',
];

export const WeeklyStats = ({ weekStart, getDayData }: WeeklyStatsProps) => {
  const stats = useMemo(() => {
    let totalWorkMinutes = 0;
    let totalPersonalMinutes = 0;
    const clientMinutes: Record<string, number> = {};
    const dailyData: Array<{ day: string; work: number; personal: number }> = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dayData = getDayData(date);
      
      let dayWork = 0;
      let dayPersonal = 0;

      dayData.entries.forEach(entry => {
        const start = new Date(entry.startTime).getTime();
        const end = new Date(entry.endTime).getTime();
        const duration = (end - start) / 1000 / 60;

        if (entry.category === 'work') {
          totalWorkMinutes += duration;
          dayWork += duration;
          
          // Track by client
          const clientKey = entry.client === 'other' && entry.customClient 
            ? entry.customClient 
            : entry.client 
              ? CLIENT_LABELS[entry.client as Client] 
              : 'Unspecified';
          clientMinutes[clientKey] = (clientMinutes[clientKey] || 0) + duration;
        } else {
          totalPersonalMinutes += duration;
          dayPersonal += duration;
        }
      });

      dailyData.push({
        day: format(date, 'EEE'),
        work: Math.round(dayWork / 60 * 10) / 10,
        personal: Math.round(dayPersonal / 60 * 10) / 10,
      });
    }

    const categoryData = [
      { name: 'Work', value: totalWorkMinutes, color: COLORS.work },
      { name: 'Personal', value: totalPersonalMinutes, color: COLORS.personal },
    ].filter(d => d.value > 0);

    const clientData = Object.entries(clientMinutes)
      .map(([name, value], index) => ({
        name,
        value,
        hours: Math.round(value / 60 * 10) / 10,
        color: CLIENT_COLORS[index % CLIENT_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalWorkMinutes,
      totalPersonalMinutes,
      categoryData,
      clientData,
      dailyData,
    };
  }, [weekStart, getDayData]);

  const totalMinutes = stats.totalWorkMinutes + stats.totalPersonalMinutes;

  if (totalMinutes === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No time entries this week yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="font-semibold text-lg text-foreground">Weekly Overview</h3>

      {/* Total Hours Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent">
          <Briefcase className="w-5 h-5 text-accent-foreground" />
          <div>
            <p className="text-sm text-accent-foreground/70">Work</p>
            <p className="text-xl font-bold font-mono text-accent-foreground">
              {formatDuration(Math.round(stats.totalWorkMinutes))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/20">
          <User className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-primary/70">Personal</p>
            <p className="text-xl font-bold font-mono text-primary">
              {formatDuration(Math.round(stats.totalPersonalMinutes))}
            </p>
          </div>
        </div>
      </div>

      {/* Category Pie Chart */}
      {stats.categoryData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Time Distribution</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                          <p className="font-medium text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(Math.round(data.value))}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {stats.categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Breakdown Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Daily Breakdown</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailyData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length > 0) {
                    return (
                      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                        <p className="font-medium text-foreground mb-1">{label}</p>
                        {payload.map((entry: any) => (
                          <p key={entry.name} className="text-sm text-muted-foreground">
                            {entry.name}: {entry.value}h
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="work" stackId="a" fill={COLORS.work} radius={[0, 0, 0, 0]} />
              <Bar dataKey="personal" stackId="a" fill={COLORS.personal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Breakdown */}
      {stats.clientData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Work by Client</h4>
          <div className="space-y-2">
            {stats.clientData.map((client, index) => (
              <div key={client.name} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: client.color }} 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {client.name}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatDuration(Math.round(client.value))}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(client.value / stats.totalWorkMinutes) * 100}%`,
                        backgroundColor: client.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
