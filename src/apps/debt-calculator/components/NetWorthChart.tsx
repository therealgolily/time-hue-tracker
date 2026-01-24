import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ScenarioResult } from "../types";

interface NetWorthChartProps {
  result: ScenarioResult;
  totalAssets: number;
}

export const NetWorthChart = ({ result, totalAssets }: NetWorthChartProps) => {
  const chartData = result.monthlyBreakdown.map((month) => ({
    month: month.month,
    netWorth: totalAssets - month.endingBalance,
    label: `Month ${month.month}`,
  }));

  const chartConfig = {
    netWorth: {
      label: "Net Worth",
      color: "hsl(var(--positive))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Projection</CardTitle>
        <CardDescription>
          Your net worth as debt decreases over time (assumes assets remain constant)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => `M${value}`}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="var(--color-netWorth)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
