# 💰 Personal Finance Dashboard

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-stack financial dashboard consolidating multiple accounts into one beautiful interface.**

[Live Demo](#) • [Features](#-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 🎯 Overview

A comprehensive personal finance dashboard that aggregates transactions from **Coinbase**, **Capital One**, and **Bitcoin Well** into a unified view with real-time analytics and visualizations.

### ✨ Key Highlights

- 📊 **Unified Dashboard** - All accounts in one place
- 📈 **Interactive Charts** - Visual spending analytics
- 💼 **Portfolio Tracking** - Real-time crypto holdings
- 🔍 **Smart Filtering** - By date, source, and category
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Lightning Fast** - Optimized with Vite

---

## 🚀 Features

### Current Features (v1.0)

✅ **Multi-Account Integration**
- Coinbase cryptocurrency trading
- Capital One banking transactions
- Bitcoin Well bitcoin purchases

✅ **Financial Analytics**
- Total net worth calculation
- Income vs expenses tracking
- Category-based spending breakdown
- Daily transaction flow visualization

✅ **Transaction Management**
- Comprehensive transaction history
- Status tracking (completed/pending)
- Automatic categorization
- Source identification

✅ **Crypto Portfolio**
- Real-time holdings display
- Individual coin valuations
- Total portfolio value
- Multiple cryptocurrency support (ETH, SOL, LINK, PUMP, PENGU)

✅ **Interactive Visualizations**
- Line charts for daily activity
- Pie charts for category breakdown
- Responsive and interactive tooltips

✅ **Smart Filters**
- Time period filtering (7 days, 30 days, 1 year)
- Source filtering by platform
- Real-time data updates

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework with Hooks
- **Vite 5.4** - Next-generation build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework

### Data Visualization
- **Recharts 2.12** - Composable charting library
- **Lucide React** - Beautiful icon set

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

---

## 📁 Project Structure

```
finance-dashboard/
├── src/
│   ├── components/
│   │   └── Dashboard.jsx      # Main dashboard component
│   ├── data/
│   │   └── transactions.js    # Transaction data & balances
│   ├── utils/
│   │   └── calculations.js    # Utility functions
│   ├── App.jsx                # Root component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── dist/                      # Production build
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ 
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/finance-dashboard.git
   cd finance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

---

## 📊 Data Structure

### Transaction Schema

```javascript
{
  id: string,              // Unique identifier
  date: string,            // ISO 8601 timestamp
  source: string,          // Platform (Coinbase, Capital One, Bitcoin Well)
  type: string,            // Transaction type (buy, sell, transfer, etc.)
  description: string,     // Human-readable description
  amount: number,          // Dollar amount
  currency: string,        // USD, USDC, etc.
  cryptoAmount: number,    // Crypto quantity (optional)
  cryptoCurrency: string,  // Crypto symbol (optional)
  status: string,          // completed | pending
  category: string         // For analytics categorization
}
```

---

## 🎨 Customization

### Update Transaction Data

Edit `src/data/transactions.js` to add your own transactions:

```javascript
export const transactions = [
  {
    id: 'unique-id',
    date: '2025-10-26',
    source: 'Coinbase',
    type: 'buy',
    description: 'ETH Purchase',
    amount: -1000.00,
    // ... more fields
  },
  // Add more transactions
];
```

### Modify Theme Colors

The app uses Tailwind CSS. Update colors in `src/components/Dashboard.jsx`:

```javascript
// Change purple theme to blue
<div className="bg-purple-500">  // Original
<div className="bg-blue-500">    // Modified
```

---

## 🔮 Roadmap

### Phase 2: AI Chat Interface (Coming Soon)
- [ ] Natural language query system
- [ ] Claude AI integration
- [ ] Conversational financial insights
- [ ] Voice-activated commands

### Phase 3: Live Data Integration
- [ ] Coinbase API connection
- [ ] Banking API integration
- [ ] Real-time balance updates
- [ ] Automatic transaction sync
- [ ] OAuth authentication

### Phase 4: Advanced Features
- [ ] Budget tracking and alerts
- [ ] Tax reporting for crypto trades
- [ ] Expense predictions using ML
- [ ] Multi-user family accounts
- [ ] Mobile app (React Native)
- [ ] Export to PDF/Excel

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x450/1e293b/8b5cf6?text=Dashboard+Overview)

### Transaction Analytics
![Analytics](https://via.placeholder.com/800x450/1e293b/3b82f6?text=Transaction+Analytics)

### Crypto Portfolio
![Portfolio](https://via.placeholder.com/800x450/1e293b/10b981?text=Crypto+Portfolio)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data Visualization
- [Lucide](https://lucide.dev/) - Icons

---

## 📊 Project Stats

![Code Size](https://img.shields.io/github/languages/code-size/yourusername/finance-dashboard)
![Last Commit](https://img.shields.io/github/last-commit/yourusername/finance-dashboard)
![Stars](https://img.shields.io/github/stars/yourusername/finance-dashboard)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ and React

</div>
