"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { Share2, Check } from "lucide-react"
import { toast } from "sonner"

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
	const [startingAmount, setStartingAmount] = useState("")
	const [monthlyRevenue, setMonthlyRevenue] = useState("")
	const [monthlyExpenses, setMonthlyExpenses] = useState("")
	const [revenueAPR, setRevenueAPR] = useState("")
	const [expenseAPR, setExpenseAPR] = useState("")
	const [selectedPeriod, setSelectedPeriod] = useState("1yr")
	const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([])
	const [isCopied, setIsCopied] = useState(false)
	const [isSharedView, setIsSharedView] = useState(false)

	// Load state from URL parameters
	useEffect(() => {
		const urlTitle = searchParams.get("title")
		const urlStartingAmount = searchParams.get("startingAmount")
		const urlRevenue = searchParams.get("revenue") || searchParams.get("income") // Backward compatibility
		const urlExpenses = searchParams.get("expenses")
		const urlRevenueAPR = searchParams.get("revenueAPR")
		const urlExpenseAPR = searchParams.get("expenseAPR")
		const urlPeriod = searchParams.get("period")
		const urlShared = searchParams.get("shared")

		if (urlTitle) setTitle(urlTitle)
		if (urlStartingAmount) setStartingAmount(urlStartingAmount)
		if (urlRevenue) setMonthlyRevenue(urlRevenue)
		if (urlExpenses) setMonthlyExpenses(urlExpenses)
		if (urlRevenueAPR) setRevenueAPR(urlRevenueAPR)
		if (urlExpenseAPR) setExpenseAPR(urlExpenseAPR)
		if (urlPeriod) setSelectedPeriod(urlPeriod)
		if (urlShared === "true") setIsSharedView(true)
	}, [searchParams])

	// Update URL parameters when state changes
	useEffect(() => {
		const params = new URLSearchParams()
		if (title) params.set("title", title)
		if (startingAmount) params.set("startingAmount", startingAmount)
		if (monthlyRevenue) params.set("revenue", monthlyRevenue)
		if (monthlyExpenses) params.set("expenses", monthlyExpenses)
		if (revenueAPR) params.set("revenueAPR", revenueAPR)
		if (expenseAPR) params.set("expenseAPR", expenseAPR)
		if (selectedPeriod) params.set("period", selectedPeriod)

		router.replace(`?${params.toString()}`, { scroll: false })
	}, [
		title,
		startingAmount,
		monthlyRevenue,
		monthlyExpenses,
		revenueAPR,
		expenseAPR,
		selectedPeriod,
		router,
	])

	// Update document title when in shared view
	useEffect(() => {
		if (isSharedView && title) {
			document.title = title
		} else if (!isSharedView) {
			document.title = "Financial Forecasting Lab"
		}
	}, [isSharedView, title])

	// Calculate forecast data with compound interest
	useEffect(() => {
		if (monthlyRevenue && monthlyExpenses) {
			const baseRevenue = parseFloat(monthlyRevenue) || 0
			const baseExpenses = parseFloat(monthlyExpenses) || 0
			const initialAmount = parseFloat(startingAmount) || 0
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
					const currentNetWorth = initialAmount + cumulativeProfit

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
						netWorth: currentNetWorth,
					})
				}

				setForecastData(data)
			}
		}
	}, [monthlyRevenue, monthlyExpenses, revenueAPR, expenseAPR, selectedPeriod, startingAmount])

	const currentPeriod = TIME_PERIODS.find((p) => p.value === selectedPeriod)
	const finalProjection = forecastData[forecastData.length - 1]

	// Calculate Break Even or Runway Ended date
	const calculateMilestoneDate = () => {
		if (forecastData.length === 0) return null

		const initialAmount = parseFloat(startingAmount) || 0
		const isPositiveTrend = finalProjection && finalProjection.netWorth > initialAmount

		if (isPositiveTrend) {
			// Look for break even point (net worth crosses zero from negative)
			if (initialAmount >= 0) {
				return { type: "positive", date: null } // Already positive
			}
			for (let i = 0; i < forecastData.length; i++) {
				if (forecastData[i].netWorth >= 0) {
					return { type: "breakEven", date: forecastData[i].date }
				}
			}
			return { type: "breakEven", date: null } // Will break even after forecast period
		} else {
			// Look for runway ended point (net worth crosses zero from positive)
			if (initialAmount <= 0) {
				return { type: "negative", date: null } // Already negative
			}
			for (let i = 0; i < forecastData.length; i++) {
				if (forecastData[i].netWorth <= 0) {
					return { type: "runwayEnded", date: forecastData[i].date }
				}
			}
			return { type: "runwayEnded", date: null } // Won't run out in forecast period
		}
	}

	const milestoneInfo = calculateMilestoneDate()

	// Handle share button click
	const handleShare = async () => {
		try {
			// Build URL with shared parameter
			const params = new URLSearchParams()
			if (title) params.set("title", title)
			if (startingAmount) params.set("startingAmount", startingAmount)
			if (monthlyRevenue) params.set("revenue", monthlyRevenue)
			if (monthlyExpenses) params.set("expenses", monthlyExpenses)
			if (revenueAPR) params.set("revenueAPR", revenueAPR)
			if (expenseAPR) params.set("expenseAPR", expenseAPR)
			if (selectedPeriod) params.set("period", selectedPeriod)
			params.set("shared", "true")
			
			const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`
			await navigator.clipboard.writeText(shareUrl)
			setIsCopied(true)
			toast.success("Copied URL to clipboard!")
			
			// Navigate to shared view
			router.push(`?${params.toString()}`)
			
			// Reset the copied state after 2 seconds
			setTimeout(() => {
				setIsCopied(false)
			}, 2000)
		} catch (err) {
			toast.error("Failed to copy URL")
		}
	}

	// Handle edit button click (exit shared view)
	const handleEdit = () => {
		setIsSharedView(false)
		const params = new URLSearchParams()
		if (title) params.set("title", title)
		if (startingAmount) params.set("startingAmount", startingAmount)
		if (monthlyRevenue) params.set("revenue", monthlyRevenue)
		if (monthlyExpenses) params.set("expenses", monthlyExpenses)
		if (revenueAPR) params.set("revenueAPR", revenueAPR)
		if (expenseAPR) params.set("expenseAPR", expenseAPR)
		if (selectedPeriod) params.set("period", selectedPeriod)
		router.push(`?${params.toString()}`)
	}

	return (
		<div className="min-h-screen bg-background p-4">
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
				<div
					className={`transition-all duration-300 ease-in-out overflow-hidden ${
						isSharedView ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
					}`}
				>
					<Card>
						<CardHeader>
							<CardTitle>Forecast Settings</CardTitle>
							<p className="text-sm text-muted-foreground">
								Interest rates are optional and represent annual growth (revenue)
								or inflation (expenses)
							</p>
						</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
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
								<Label htmlFor="startingAmount">Starting Amount ($)</Label>
								<Input
									id="startingAmount"
									type="number"
									placeholder="10000"
									value={startingAmount}
									onChange={(e) => setStartingAmount(e.target.value)}
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
				</div>

				{/* Chart */}
				{forecastData.length > 0 && (
					<Card className="forecast-pdf-area">
						<CardHeader>
							<div className="flex items-start justify-between">
								<CardTitle>
									{title || "Financial Forecast"} - {currentPeriod?.label}
								</CardTitle>
								{isSharedView ? (
									<Button
										onClick={handleEdit}
										variant="outline"
										size="sm"
										className="shrink-0"
									>
										Edit
									</Button>
								) : (
									<Button
										onClick={handleShare}
										variant="outline"
										size="sm"
										className="shrink-0 transition-all"
									>
										{isCopied ? (
											<>
												<Check className="h-4 w-4 mr-2" />
												Copied!
											</>
										) : (
											<>
												<Share2 className="h-4 w-4 mr-2" />
												Share
											</>
										)}
									</Button>
								)}
							</div>
							{finalProjection && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
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
									{milestoneInfo && (
										<div className="space-y-1">
											<p className="text-muted-foreground">
												{milestoneInfo.type === "breakEven" ? "Break Even" : 
												 milestoneInfo.type === "runwayEnded" ? "Runway Ended" :
												 milestoneInfo.type === "positive" ? "Status" : "Status"}
											</p>
											<p className={`text-2xl font-bold ${
												milestoneInfo.type === "breakEven" ? "text-green-600" :
												milestoneInfo.type === "runwayEnded" ? "text-red-600" :
												milestoneInfo.type === "positive" ? "text-green-600" : "text-gray-600"
											}`}>
												{milestoneInfo.date ? milestoneInfo.date : 
												 milestoneInfo.type === "positive" ? "Profitable" :
												 milestoneInfo.type === "negative" ? "In Deficit" :
												 milestoneInfo.type === "breakEven" ? "Beyond Forecast" :
												 "Beyond Forecast"}
											</p>
										</div>
									)}
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
									netWorth: {
										label: "Net Worth",
										color: "hsl(280, 70%, 50%)",
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
											<linearGradient
												id="netWorthGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="hsl(280, 70%, 50%)"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="hsl(280, 70%, 50%)"
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
										<Area
											type="monotone"
											dataKey="netWorth"
											stroke="hsl(280, 70%, 50%)"
											strokeWidth={2}
											fill="url(#netWorthGradient)"
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
