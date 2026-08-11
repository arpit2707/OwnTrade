import pandas as pd
import numpy as np
import config

class TradingStrategy:
    """
    Algorithmic Trading Strategies:
    1. EMA Crossover Strategy (Fast EMA vs Slow EMA)
    2. RSI Strategy (Overbought / Oversold)
    """

    @staticmethod
    def calculate_ema(df, period, column="close"):
        """Calculates Exponential Moving Average (EMA)."""
        return df[column].ewm(span=period, adjust=False).mean()

    @staticmethod
    def calculate_rsi(df, period=14, column="close"):
        """Calculates Relative Strength Index (RSI)."""
        delta = df[column].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    @classmethod
    def apply_indicators(cls, historical_data):
        """
        Accepts historical candle records (list of dicts) and returns DataFrame with indicators.
        """
        if not historical_data:
            return pd.DataFrame()

        df = pd.DataFrame(historical_data)
        
        # Calculate EMA Indicators
        df[f"ema_{config.FAST_EMA}"] = cls.calculate_ema(df, config.FAST_EMA)
        df[f"ema_{config.SLOW_EMA}"] = cls.calculate_ema(df, config.SLOW_EMA)
        
        # Calculate RSI Indicator
        df["rsi"] = cls.calculate_rsi(df, config.RSI_PERIOD)
        
        return df

    @classmethod
    def generate_ema_crossover_signal(cls, df):
        """
        Generates Buy / Sell / Hold signal based on EMA crossover:
        - Bullish Signal (BUY): Fast EMA crosses above Slow EMA.
        - Bearish Signal (SELL): Fast EMA crosses below Slow EMA.
        """
        if df.empty or len(df) < config.SLOW_EMA + 1:
            return "HOLD"

        fast_col = f"ema_{config.FAST_EMA}"
        slow_col = f"ema_{config.SLOW_EMA}"

        prev_fast = df[fast_col].iloc[-2]
        prev_slow = df[slow_col].iloc[-2]

        curr_fast = df[fast_col].iloc[-1]
        curr_slow = df[slow_col].iloc[-1]

        # Crossover logic
        if prev_fast <= prev_slow and curr_fast > curr_slow:
            return "BUY"
        elif prev_fast >= prev_slow and curr_fast < curr_slow:
            return "SELL"
        
        return "HOLD"

    @classmethod
    def generate_rsi_signal(cls, df):
        """
        Generates Buy / Sell signal based on RSI thresholds:
        - BUY: RSI < 30 (Oversold)
        - SELL: RSI > 70 (Overbought)
        """
        if df.empty or "rsi" not in df.columns or len(df) < config.RSI_PERIOD + 1:
            return "HOLD"

        curr_rsi = df["rsi"].iloc[-1]

        if curr_rsi < config.RSI_OVERSOLD:
            return "BUY"
        elif curr_rsi > config.RSI_OVERBOUGHT:
            return "SELL"

        return "HOLD"
