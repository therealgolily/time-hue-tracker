import { format, differenceInMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../lib/calculations";
import { cn } from "@/lib/utils";

interface TimelineCard {
  cardId: string;
  cardName: string;
  currentBalance: number;
  apr: number;
  payoffDate: Date;
  monthsToPayoff?: number;
  payoffOrder?: number;
  totalInterest: number;
}

interface PayoffTimelineProps {
  results: TimelineCard[];
  startDate: Date;
  endDate: Date;
  strategy: "snowball" | "avalanche" | "simultaneous";
}

// Color palette for cards (using CSS custom properties)
const CARD_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

export const PayoffTimeline: React.FC<PayoffTimelineProps> = ({
  results,
  startDate,
  endDate,
  strategy,
}) => {
  const totalMonths = differenceInMonths(endDate, startDate);
  
  if (totalMonths <= 0 || results.length === 0) return null;

  // Sort by payoff date for display
  const sortedResults = [...results].sort((a, b) => 
    a.payoffDate.getTime() - b.payoffDate.getTime()
  );

  // Generate month markers
  const monthMarkers: { label: string; position: number }[] = [];
  const interval = totalMonths <= 12 ? 1 : totalMonths <= 24 ? 3 : totalMonths <= 48 ? 6 : 12;
  
  for (let i = 0; i <= totalMonths; i += interval) {
    const markerDate = new Date(startDate);
    markerDate.setMonth(markerDate.getMonth() + i);
    monthMarkers.push({
      label: format(markerDate, totalMonths <= 24 ? "MMM ''yy" : "MMM ''yy"),
      position: (i / totalMonths) * 100,
    });
  }

  // Ensure end marker is included
  if (monthMarkers[monthMarkers.length - 1]?.position !== 100) {
    monthMarkers.push({
      label: format(endDate, "MMM ''yy"),
      position: 100,
    });
  }

  return (
    <Card className="border-2 border-foreground">
      <CardHeader className="border-b-2 border-foreground pb-4">
        <CardTitle className="text-lg font-bold uppercase tracking-wider">
          Payoff Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Timeline Container */}
        <div className="relative">
          {/* Month Labels */}
          <div className="relative h-8 mb-2">
            {monthMarkers.map((marker, i) => (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 text-[10px] font-mono text-muted-foreground whitespace-nowrap"
                style={{ left: `${marker.position}%` }}
              >
                {marker.label}
              </div>
            ))}
          </div>

          {/* Main Timeline Track */}
          <div className="relative h-3 bg-muted rounded-full mb-6">
            {/* Month marker ticks */}
            {monthMarkers.map((marker, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-foreground/20"
                style={{ left: `${marker.position}%` }}
              />
            ))}
            
            {/* Progress fill - gradient to first payoff */}
            <div 
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/80 to-primary/40"
              style={{ 
                width: `${(differenceInMonths(sortedResults[sortedResults.length - 1].payoffDate, startDate) / totalMonths) * 100}%` 
              }}
            />

            {/* Payoff markers on timeline */}
            {sortedResults.map((card, index) => {
              const monthsFromStart = differenceInMonths(card.payoffDate, startDate);
              const position = (monthsFromStart / totalMonths) * 100;
              const color = CARD_COLORS[index % CARD_COLORS.length];
              
              return (
                <div
                  key={card.cardId}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer z-10"
                  style={{ left: `${position}%` }}
                >
                  {/* Marker dot */}
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-background shadow-lg transition-transform hover:scale-125"
                    style={{ backgroundColor: color }}
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-popover text-popover-foreground text-xs rounded-lg shadow-lg p-2 whitespace-nowrap border">
                      <p className="font-bold">{card.cardName}</p>
                      <p className="text-muted-foreground">Paid off {format(card.payoffDate, "MMM yyyy")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Legend / Breakdown */}
          <div className="grid gap-3 mt-6">
            {sortedResults.map((card, index) => {
              const monthsFromStart = differenceInMonths(card.payoffDate, startDate);
              const position = (monthsFromStart / totalMonths) * 100;
              const color = CARD_COLORS[index % CARD_COLORS.length];
              
              return (
                <div
                  key={card.cardId}
                  className="flex items-center gap-4 group"
                >
                  {/* Color indicator and order */}
                  <div className="flex items-center gap-2 min-w-[60px]">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {strategy !== "simultaneous" && card.payoffOrder && (
                      <span className="text-xs font-mono text-muted-foreground">
                        #{card.payoffOrder}
                      </span>
                    )}
                  </div>
                  
                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{card.cardName}</span>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        {format(card.payoffDate, "MMM yyyy")}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="relative h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${position}%`,
                          backgroundColor: color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
                      <span>{formatCurrency(card.currentBalance)} balance</span>
                      <span>{card.apr}% APR</span>
                      <span>{card.monthsToPayoff} months</span>
                      <span className="text-destructive/70">{formatCurrency(card.totalInterest)} interest</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debt-free celebration marker */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-dashed border-muted-foreground/30">
            <div className="text-2xl">🎉</div>
            <div className="text-center">
              <p className="text-sm font-bold text-primary">
                Debt-Free by {format(endDate, "MMMM yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalMonths} months from now
              </p>
            </div>
            <div className="text-2xl">🎉</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
