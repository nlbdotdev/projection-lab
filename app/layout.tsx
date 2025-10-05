import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

// Font configurations
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

// Application metadata
export const metadata: Metadata = {
	title: "Financial Forecasting Lab",
	description: "A lite web app for financial forecasting and projections",
}

/**
 * Root Layout Component
 *
 * The main layout wrapper for the entire application. Provides:
 * - Font loading and CSS variables
 * - Theme provider for dark/light mode support
 * - Base HTML structure with proper accessibility attributes
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
