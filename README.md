# 🤖 Zerodha Algorithmic Trading System (Python + Node.js)

Complete, modular Algorithmic Trading Framework for Zerodha KiteConnect API.

---

## 📂 Project Architecture

```
d:\Grow\Z\
├── config.py              # Zerodha API keys, symbols, risk management & indicator parameters
├── zerodha_client.py      # Core Zerodha API client wrapper (Login, Orders, Positions, OHLC)
├── strategy.py            # EMA Crossover & RSI Technical Indicators & Signals
├── live_ticker.py         # Real-time WebSocket ticks via KiteTicker
├── main.py                # Main execution script / CLI dashboard
├── zerodha_trading.py     # Simple standalone Python starter script
├── zerodha_trading.js     # Simple standalone Node.js starter script
└── package.json           # Node.js package setup
```

---

## 🚀 How to Setup & Run

### Step 1: Get Zerodha API Credentials
1. Go to [https://kite.trade](https://kite.trade) and create a developer account.
2. Create a new App and copy your **API Key** and **API Secret**.

### Step 2: Configure Credentials
Open `config.py` and set your credentials:
```python
API_KEY = "your_actual_api_key"
API_SECRET = "your_actual_api_secret"
```

### Step 3: Run the Trading System
Execute the main trading system:
```powershell
py -3.12 main.py
```

---

## ⚡ Features Included
- **Exponential Moving Average (EMA) Crossover Strategy**: Calculates 9-period & 21-period EMA crossover signals.
- **Relative Strength Index (RSI) Filter**: Identifies oversold (< 30) and overbought (> 70) conditions.
- **Risk Management**: Configurable Stop Loss % and Target Profit %.
- **Real-Time WebSockets**: Live tick updates via Zerodha `KiteTicker`.
- **Order Execution**: Buy/Sell Market & Limit orders.
