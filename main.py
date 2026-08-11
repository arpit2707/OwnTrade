import sys
import os
import time
import logging

# Ensure UTF-8 output encoding for Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from zerodha_client import ZerodhaAlgoClient
from strategy import TradingStrategy
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def main():
    print("==============================================================")
    print("   ZERODHA ALGORITHMIC TRADING FRAMEWORK (PYTHON)   ")
    print("==============================================================")
    
    client = ZerodhaAlgoClient()

    # Step 1: Authentication Check
    if not config.ACCESS_TOKEN:
        print("\n[!] ACCESS_TOKEN is missing in config.py!")
        print("Please follow these steps to login:")
        login_url = client.get_login_url()
        print(f"\n1. Open this URL in browser:\n   {login_url}")
        print("\n2. Login to Zerodha and copy the 'request_token' from the redirected URL.")
        print("\n3. Paste the request_token in config.py or enter it when prompted.")
        return

    # Step 2: Account Profile & Margin Verification
    print("\n--- Checking Account Details ---")
    profile, margins = client.fetch_profile_and_margins()

    # Step 3: Test Technical Analysis & Strategy Signal
    print(f"\n--- Running Algo Strategy ({config.TRADING_SYMBOL}) ---")
    
    # RELIANCE Instrument Token on NSE (example token: 738561)
    sample_instrument_token = 738561 
    
    historical_candles = client.get_historical_candles(
        instrument_token=sample_instrument_token,
        interval="5minute"
    )

    if historical_candles:
        df = TradingStrategy.apply_indicators(historical_candles)
        ema_signal = TradingStrategy.generate_ema_crossover_signal(df)
        rsi_signal = TradingStrategy.generate_rsi_signal(df)
        
        latest_candle = df.iloc[-1]
        print(f"\nLatest Candle Time: {latest_candle['date']}")
        print(f"Close Price: RS {latest_candle['close']}")
        print(f"EMA 9: {latest_candle.get(f'ema_{config.FAST_EMA}', 0):.2f}")
        print(f"EMA 21: {latest_candle.get(f'ema_{config.SLOW_EMA}', 0):.2f}")
        print(f"RSI: {latest_candle.get('rsi', 0):.2f}")
        
        print(f"\nEMA Crossover Signal: {ema_signal}")
        print(f"RSI Signal:           {rsi_signal}")

        # Step 4: Execution Logic
        if ema_signal == "BUY" or rsi_signal == "BUY":
            print(f"\nSIGNAL MATCHED: Executing BUY Order for {config.QUANTITY} qty of {config.TRADING_SYMBOL}...")
            # client.place_order(config.TRADING_SYMBOL, config.EXCHANGE, "BUY", config.QUANTITY)
        elif ema_signal == "SELL" or rsi_signal == "SELL":
            print(f"\nSIGNAL MATCHED: Executing SELL Order for {config.QUANTITY} qty of {config.TRADING_SYMBOL}...")
            # client.place_order(config.TRADING_SYMBOL, config.EXCHANGE, "SELL", config.QUANTITY)
        else:
            print("\nSignal is HOLD. No orders placed.")

if __name__ == "__main__":
    main()
