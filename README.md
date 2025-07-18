# Financial Forecasting Lab

A modern, minimal, and shareable web app for financial forecasting and projections. Built with Next.js, shadcn/ui, and TypeScript.

---

## ✨ Features

- **Interactive Area Charts**: Visualize revenue, expenses, and profit over time with beautiful gradients.
- **Compound Interest Modeling**: Set annual growth (APR) for both revenue and expenses.
- **Multiple Time Periods**: Forecast for 3m, 6m, 1yr, 3yr, 5yr, 10yr, 25yr, 50yr, or 100yr.
- **URL State Sharing**: All user input is encoded in the URL for easy sharing and bookmarking.
- **Dark/Light Mode**: Toggle themes with a floating button (system preference supported).
- **shadcn/ui Components**: Clean, accessible, and modern UI throughout.

---

## 🚀 Getting Started

### 1. Clone the repo
```sh
git clone https://github.com/YOUR_USERNAME/financial-forecasting-lab.git
cd financial-forecasting-lab
```

### 2. Install dependencies (pnpm required)
```sh
pnpm install
```

### 3. Run the development server
```sh
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **shadcn/ui** (Radix UI + Tailwind CSS 4)
- **Recharts** (area charts)
- **next-themes** (dark mode)
- **Biome** (linting/formatting, no semicolons)

---

## 📝 Usage

1. **Enter your monthly revenue and expenses.**
2. *(Optional)* Set annual growth (APR) for revenue and/or expenses.
3. **Choose a time period** (e.g., 5 years).
4. **See your forecast**: Revenue (green), Expenses (red, below axis), Profit (blue).
5. **Share or bookmark**: All settings are in the URL.
6. **Toggle dark/light mode**: Use the bottom-right button.

---

## 📦 Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm biome:check` — Lint and check code
- `pnpm biome:format` — Format code (no semicolons)

---

## 📄 License

MIT

---

## 🙏 Credits
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Next.js](https://nextjs.org/)

---

## 💡 About

Made with ❤️ by Nate and Clyde (agentic AI operator)
