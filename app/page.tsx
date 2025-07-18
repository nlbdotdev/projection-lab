"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ThemeToggle } from "@/components/theme-toggle";

const TIME_PERIODS = [
  { value: "3m", label: "3 Months", months: 3 },
  { value: "6m", label: "6 Months", months: 6 },
  { value: "1yr", label: "1 Year", months: 12 },
  { value: "3yr", label: "3 Years", months: 36 },
  { value: "5yr", label: "5 Years", months: 60 },
  { value: "10yr", label: "10 Years", months: 120 },
  { value: "25yr", label: "25 Years", months: 300 },
  { value: "50yr", label: "50 Years", months: 600 },
  { value: "100yr", label: "100 Years", months: 1200 },
];

interface ForecastDataPoint {
  month: number;
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  netWorth: number;
}

export default function FinancialForecastingApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("1yr");
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);

  // Load state from URL parameters
  useEffect(() => {
    const urlTitle = searchParams.get("title");
    const urlRevenue = searchParams.get("revenue") || searchParams.get("income"); // Backward compatibility
    const urlExpenses = searchParams.get("expenses");
    const urlPeriod = searchParams.get("period");

    if (urlTitle) setTitle(urlTitle);
    if (urlRevenue) setMonthlyRevenue(urlRevenue);
    if (urlExpenses) setMonthlyExpenses(urlExpenses);
    if (urlPeriod) setSelectedPeriod(urlPeriod);
  }, [searchParams]);

  // Update URL parameters when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (monthlyRevenue) params.set("revenue", monthlyRevenue);
    if (monthlyExpenses) params.set("expenses", monthlyExpenses);
    if (selectedPeriod) params.set("period", selectedPeriod);
    
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [title, monthlyRevenue, monthlyExpenses, selectedPeriod, router]);

  // Calculate forecast data
  useEffect(() => {
    if (monthlyRevenue && monthlyExpenses) {
      const revenue = parseFloat(monthlyRevenue) || 0;
      const expenses = parseFloat(monthlyExpenses) || 0;
      const netSavings = revenue - expenses;
      const period = TIME_PERIODS.find(p => p.value === selectedPeriod);
      
      if (period) {
        const data = [];
        let cumulativeRevenue = 0;
        let cumulativeExpenses = 0;
        
        for (let month = 0; month <= period.months; month++) {
          cumulativeRevenue += revenue;
          cumulativeExpenses += expenses;
          
          const date = new Date();
          date.setMonth(date.getMonth() + month);
          
          const cumulativeProfit = cumulativeRevenue - cumulativeExpenses;
          
          data.push({
            month,
            date: date.toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "short",
              ...(period.months <= 12 ? {} : { day: undefined })
            }),
            revenue: cumulativeRevenue,
            expenses: -cumulativeExpenses, // Make expenses negative for display
            profit: cumulativeProfit,
            netWorth: cumulativeRevenue - cumulativeExpenses,
          });
        }
        
        setForecastData(data);
      }
    }
  }, [monthlyRevenue, monthlyExpenses, selectedPeriod]);

  const currentPeriod = TIME_PERIODS.find(p => p.value === selectedPeriod);
  const finalProjection = forecastData[forecastData.length - 1];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Financial Forecasting Lab</h1>
          <p className="text-muted-foreground">
            Visualize your financial future with interactive projections
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Forecast Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="My Financial Plan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
                             <div className="space-y-2">
                 <Label htmlFor="revenue">Monthly Revenue ($)</Label>
                 <Input
                   id="revenue"
                   type="number"
                   placeholder="5000"
                   value={monthlyRevenue}
                   onChange={(e) => setMonthlyRevenue(e.target.value)}
                 />
               </div>
              
              <div className="space-y-2">
                <Label htmlFor="expenses">Monthly Expenses ($)</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="3000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        {forecastData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {title || "Financial Forecast"} - {currentPeriod?.label}
              </CardTitle>
                             {finalProjection && (
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                   <div className="space-y-1">
                     <p className="text-muted-foreground">Total Revenue</p>
                     <p className="text-2xl font-bold text-green-600">
                       ${finalProjection.revenue.toLocaleString()}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-muted-foreground">Total Expenses</p>
                     <p className="text-2xl font-bold text-red-600">
                       ${Math.abs(finalProjection.expenses).toLocaleString()}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-muted-foreground">Total Profit</p>
                     <p className={`text-2xl font-bold ${finalProjection.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                       ${finalProjection.profit.toLocaleString()}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-muted-foreground">Net Worth</p>
                     <p className={`text-2xl font-bold ${finalProjection.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       ${finalProjection.netWorth.toLocaleString()}
                     </p>
                   </div>
                 </div>
               )}
            </CardHeader>
            <CardContent>
                             <ChartContainer
                 config={{
                   revenue: {
                     label: "Revenue",
                     color: "hsl(142, 76%, 36%)",
                   },
                   expenses: {
                     label: "Expenses",
                     color: "hsl(0, 84%, 60%)",
                   },
                   profit: {
                     label: "Profit",
                     color: "hsl(220, 90%, 56%)",
                   },
                 }}
                 className="h-96 w-full"
               >
                <ResponsiveContainer width="100%" height="100%">
                                     <AreaChart data={forecastData}>
                     <defs>
                       <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                       </linearGradient>
                       <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                       </linearGradient>
                       <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.1}/>
                       </linearGradient>
                     </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={Math.max(1, Math.floor(forecastData.length / 10))}
                    />
                                         <YAxis 
                       tick={{ fontSize: 12 }}
                       tickFormatter={(value) => `${value < 0 ? '-' : ''}$${Math.abs(value / 1000).toFixed(0)}k`}
                     />
                                         <ChartTooltip 
                       content={({ active, payload, label }) => {
                         if (active && payload && payload.length) {
                           return (
                             <div className="bg-background border rounded-lg p-3 shadow-lg">
                               <p className="font-semibold">{label}</p>
                               {payload.map((entry) => {
                                 const value = Number(entry.value) || 0;
                                 const displayValue = entry.dataKey === 'expenses' ? Math.abs(value) : value;
                                 return (
                                   <p key={entry.dataKey} style={{ color: entry.color }}>
                                     {entry.name}: ${displayValue.toLocaleString()}
                                   </p>
                                 );
                               })}
                             </div>
                           );
                         }
                         return null;
                       }}
                     />
                                         <Area
                       type="monotone"
                       dataKey="revenue"
                       stroke="hsl(142, 76%, 36%)"
                       strokeWidth={2}
                       fill="url(#revenueGradient)"
                     />
                     <Area
                       type="monotone"
                       dataKey="expenses"
                       stroke="hsl(0, 84%, 60%)"
                       strokeWidth={2}
                       fill="url(#expensesGradient)"
                     />
                     <Area
                       type="monotone"
                       dataKey="profit"
                       stroke="hsl(220, 90%, 56%)"
                       strokeWidth={2}
                       fill="url(#profitGradient)"
                     />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {forecastData.length === 0 && (
                     <Card>
             <CardContent className="text-center py-8">
               <p className="text-muted-foreground">
                 Enter your monthly revenue and expenses to see your financial forecast
               </p>
             </CardContent>
           </Card>
                 )}
       </div>
       <ThemeToggle />
     </div>
   );
 }
