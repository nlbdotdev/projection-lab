"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	ChartContainer,
	ChartTooltip,
} from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExtrasMenu } from "@/components/extras-menu"

// Available time periods for financial forecasting
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
]

// Data structure for individual forecast data points
interface ForecastDataPoint {
	month: number
	date: string
	revenue: number
	expenses: number
	profit: number
	netWorth: number
}

/**
 * Financial Forecasting Application
 *
 * A comprehensive financial planning tool that projects revenue, expenses, and profit
 * over various time periods. Features include:
 * - Compound interest calculations for both revenue growth and expense inflation
 * - Interactive area charts with gradient fills
 * - URL parameter state management for easy sharing
 * - Dark/light theme support
 * - Responsive design with shadcn/ui components
 */
function FinancialForecastingApp() {
	const searchParams = useSearchParams()
	const router = useRouter()

	const [title, setTitle] = useState("")
	const [monthlyRevenue, setMonthlyRevenue] = useState("")
	const [monthlyExpenses, setMonthlyExpenses] = useState("")
	const [revenueAPR, setRevenueAPR] = useState("")
	const [expenseAPR, setExpenseAPR] = useState("")
	const [selectedPeriod, setSelectedPeriod] = useState("1yr")
	const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([])

	// Load state from URL parameters
	useEffect(() => {
		const urlTitle = searchParams.get("title")
		const urlRevenue = searchParams.get("revenue") || searchParams.get("income") // Backward compatibility
		const urlExpenses = searchParams.get("expenses")
		const urlRevenueAPR = searchParams.get("revenueAPR")
		const urlExpenseAPR = searchParams.get("expenseAPR")
		const urlPeriod = searchParams.get("period")

		if (urlTitle) setTitle(urlTitle)
		if (urlRevenue) setMonthlyRevenue(urlRevenue)
		if (urlExpenses) setMonthlyExpenses(urlExpenses)
		if (urlRevenueAPR) setRevenueAPR(urlRevenueAPR)
		if (urlExpenseAPR) setExpenseAPR(urlExpenseAPR)
		if (urlPeriod) setSelectedPeriod(urlPeriod)
	}, [searchParams])

	// Update URL parameters when state changes
	useEffect(() => {
		const params = new URLSearchParams()
		if (title) params.set("title", title)
		if (monthlyRevenue) params.set("revenue", monthlyRevenue)
		if (monthlyExpenses) params.set("expenses", monthlyExpenses)
		if (revenueAPR) params.set("revenueAPR", revenueAPR)
		if (expenseAPR) params.set("expenseAPR", expenseAPR)
		if (selectedPeriod) params.set("period", selectedPeriod)

		router.replace(`?${params.toString()}`, { scroll: false })
	}, [
		title,
		monthlyRevenue,
		monthlyExpenses,
		revenueAPR,
		expenseAPR,
		selectedPeriod,
		router,
	])

	// Calculate forecast data with compound interest
	useEffect(() => {
		if (monthlyRevenue && monthlyExpenses) {
			const baseRevenue = parseFloat(monthlyRevenue) || 0
			const baseExpenses = parseFloat(monthlyExpenses) || 0
			// Convert annual percentage rates to monthly decimal rates
			const revenueInterestRate = (parseFloat(revenueAPR) || 0) / 12 / 100
			const expenseInterestRate = (parseFloat(expenseAPR) || 0) / 12 / 100
			const period = TIME_PERIODS.find((p) => p.value === selectedPeriod)

			if (period) {
				const data = []
				let cumulativeRevenue = 0
				let cumulativeExpenses = 0
				let currentMonthlyRevenue = baseRevenue
				let currentMonthlyExpenses = baseExpenses

				// Generate data points for each month in the selected period
				for (let month = 0; month <= period.months; month++) {
					// Apply compound interest growth after the first month
					if (month > 0) {
						currentMonthlyRevenue *= 1 + revenueInterestRate
						currentMonthlyExpenses *= 1 + expenseInterestRate
					}

					// Accumulate totals
					cumulativeRevenue += currentMonthlyRevenue
					cumulativeExpenses += currentMonthlyExpenses

					// Generate date label for this data point
					const date = new Date()
					date.setMonth(date.getMonth() + month)

					const cumulativeProfit = cumulativeRevenue - cumulativeExpenses

					data.push({
						month,
						date: date.toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							// Hide day for longer time periods to reduce clutter
							...(period.months <= 12 ? {} : { day: undefined }),
						}),
						revenue: cumulativeRevenue,
						expenses: -cumulativeExpenses, // Negative for display below x-axis
						profit: cumulativeProfit,
						netWorth: cumulativeRevenue - cumulativeExpenses,
					})
				}

				setForecastData(data)
			}
		}
	}, [monthlyRevenue, monthlyExpenses, revenueAPR, expenseAPR, selectedPeriod])

	const currentPeriod = TIME_PERIODS.find((p) => p.value === selectedPeriod)
	const finalProjection = forecastData[forecastData.length - 1]

	// Theme switching handler
	const handleThemeChange = (theme: string) => {
		const html = document.documentElement
		html.classList.remove("gumroad", "linear", "notion")
		if (theme === "gumroad") html.classList.add("gumroad")
		else if (theme === "linear") html.classList.add("linear")
		else if (theme === "notion") html.classList.add("notion")
		// Default: no extra class
	}

	return (
		<div className="min-h-screen bg-background p-4">
			<ExtrasMenu onThemeChange={handleThemeChange} />
			{/* Main UI */}
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
						<p className="text-sm text-muted-foreground">
							Interest rates are optional and represent annual growth (revenue)
							or inflation (expenses)
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
								<Label htmlFor="revenueAPR">Revenue APR (%)</Label>
								<Input
									id="revenueAPR"
									type="number"
									step="0.1"
									placeholder="3.0"
									value={revenueAPR}
									onChange={(e) => setRevenueAPR(e.target.value)}
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
								<Label htmlFor="expenseAPR">Expense APR (%)</Label>
								<Input
									id="expenseAPR"
									type="number"
									step="0.1"
									placeholder="2.5"
									value={expenseAPR}
									onChange={(e) => setExpenseAPR(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="period">Time Period</Label>
								<Select
									value={selectedPeriod}
									onValueChange={setSelectedPeriod}
								>
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
					<Card className="forecast-pdf-area">
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
										<p
											className={`text-2xl font-bold ${finalProjection.profit >= 0 ? "text-blue-600" : "text-red-600"}`}
										>
											${finalProjection.profit.toLocaleString()}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground">Net Worth</p>
										<p
											className={`text-2xl font-bold ${finalProjection.netWorth >= 0 ? "text-green-600" : "text-red-600"}`}
										>
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
											<linearGradient
												id="revenueGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="hsl(142, 76%, 36%)"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="hsl(142, 76%, 36%)"
													stopOpacity={0.1}
												/>
											</linearGradient>
											<linearGradient
												id="expensesGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="hsl(0, 84%, 60%)"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="hsl(0, 84%, 60%)"
													stopOpacity={0.1}
												/>
											</linearGradient>
											<linearGradient
												id="profitGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="hsl(220, 90%, 56%)"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="hsl(220, 90%, 56%)"
													stopOpacity={0.1}
												/>
											</linearGradient>
										</defs>
										<XAxis
											dataKey="date"
											tick={{ fontSize: 12 }}
											interval={Math.max(
												1,
												Math.floor(forecastData.length / 10),
											)}
										/>
										<YAxis
											tick={{ fontSize: 12 }}
											tickFormatter={(value) =>
												`${value < 0 ? "-" : ""}$${Math.abs(value / 1000).toFixed(0)}k`
											}
										/>
										<ChartTooltip
											content={({ active, payload, label }) => {
												if (active && payload && payload.length) {
													return (
														<div className="bg-background border rounded-lg p-3 shadow-lg">
															<p className="font-semibold">{label}</p>
															{payload.map((entry) => {
																const value = Number(entry.value) || 0
																const displayValue =
																	entry.dataKey === "expenses"
																		? Math.abs(value)
																		: value
																return (
																	<p
																		key={entry.dataKey}
																		style={{ color: entry.color }}
																	>
																		{entry.name}: $
																		{displayValue.toLocaleString()}
																	</p>
																)
															})}
														</div>
													)
												}
												return null
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
								Enter your monthly revenue and expenses to see your financial
								forecast
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Optional: Add interest rates to model growth or inflation over
								time
							</p>
						</CardContent>
					</Card>
				)}
			</div>
			<ThemeToggle />
		</div>
	)
}

// Wrap the main component in Suspense for useSearchParams
export default function Page() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center">
					Loading...
				</div>
			}
		>
			<FinancialForecastingApp />
		</Suspense>
	)
}
