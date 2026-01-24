import { ScenarioResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "../lib/calculations";

interface InterestPrincipalChartProps {
  result: ScenarioResult;
}

export const InterestPrincipalChart: React.FC<InterestPrincipalChartProps> = ({ result }) => {
  const chartData = result.monthlyBreakdown.map((month) => ({
    month: month.month,
    interest: month.interest,
    principal: month.principal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest vs Principal Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              label={{ value: "Month", position: "insideBottom", offset: -5 }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `$${value.toFixed(0)}`}
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
            <Bar
              dataKey="interest"
              fill="hsl(var(--chart-3))"
              name="Interest"
              stackId="a"
            />
            <Bar
              dataKey="principal"
              fill="hsl(var(--chart-2))"
              name="Principal"
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
