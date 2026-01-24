import { ScenarioResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "../lib/calculations";

interface PayoffChartProps {
  result: ScenarioResult;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({ result }) => {
  const chartData = result.monthlyBreakdown.map((month) => ({
    month: month.month,
    balance: month.endingBalance,
    interestPaid: month.totalInterestPaid,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              label={{ value: "Month", position: "insideBottom", offset: -5 }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              className="text-xs"
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="Remaining Balance"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="interestPaid"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Total Interest Paid"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
