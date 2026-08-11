import os

# ======================================================
# ZERODHA ALGO TRADING CONFIGURATION
# ======================================================

# Zerodha API Credentials (Get from https://kite.trade)
API_KEY = os.getenv("ZERODHA_API_KEY", "YOUR_API_KEY")
API_SECRET = os.getenv("ZERODHA_API_SECRET", "YOUR_API_SECRET")
ACCESS_TOKEN = os.getenv("ZERODHA_ACCESS_TOKEN", "")  # Generated after login

# Trading Parameters
TRADING_SYMBOL = "RELIANCE"    # Default Stock/Symbol (e.g. RELIANCE, NIFTY 50, etc.)
EXCHANGE = "NSE"               # NSE, BSE, NFO, BFO, MCX
PRODUCT_TYPE = "MIS"           # MIS (Intraday) or CNC (Delivery) / NRML (Futures/Options)
QUANTITY = 1                   # Quantity per trade

# Risk Management
STOP_LOSS_PERCENT = 1.0        # Stop Loss %
TARGET_PERCENT = 2.0           # Target / Profit %
MAX_TRADES_PER_DAY = 5         # Maximum allowed trades per day

# Strategy Settings
FAST_EMA = 9                   # Fast Exponential Moving Average period
SLOW_EMA = 21                  # Slow Exponential Moving Average period
RSI_PERIOD = 14                # RSI period
RSI_OVERSOLD = 30              # RSI oversold threshold
RSI_OVERBOUGHT = 70            # RSI overbought threshold
