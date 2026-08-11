import sys
import logging
from kiteconnect import KiteConnect
import config

sys.stdout.reconfigure(encoding='utf-8')
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class ZerodhaAlgoClient:
    def __init__(self):
        self.api_key = config.API_KEY
        self.api_secret = config.API_SECRET
        self.kite = KiteConnect(api_key=self.api_key)
        
        if config.ACCESS_TOKEN:
            self.kite.set_access_token(config.ACCESS_TOKEN)
            logging.info("Access Token set from config.")

    def get_login_url(self):
        """Returns login URL to get request token."""
        url = self.kite.login_url()
        logging.info(f"Generated Login URL: {url}")
        return url

    def generate_session(self, request_token):
        """Generates access token after user logs in."""
        try:
            data = self.kite.generate_session(request_token, api_secret=self.api_secret)
            access_token = data["access_token"]
            self.kite.set_access_token(access_token)
            logging.info("[SUCCESS] Session generated successfully!")
            logging.info(f"Save your ACCESS_TOKEN in config.py or environment: {access_token}")
            return data
        except Exception as e:
            logging.error(f"[ERROR] Failed to generate session: {e}")
            return None

    def fetch_profile_and_margins(self):
        """Fetches account details and available margin balance."""
        try:
            profile = self.kite.profile()
            margins = self.kite.margins(segment="equity")
            available_balance = margins.get("available", {}).get("live_balance", 0)
            
            logging.info(f"User: {profile.get('user_name')} ({profile.get('user_id')})")
            logging.info(f"Available Margin Balance: RS {available_balance}")
            return profile, margins
        except Exception as e:
            logging.error(f"[ERROR] Error fetching profile/margins: {e}")
            return None, None

    def get_historical_candles(self, instrument_token, interval="5minute", from_date="2026-07-01", to_date="2026-07-20"):
        """Fetches historical OHLC candle data for backtesting / technical analysis."""
        try:
            records = self.kite.historical_data(instrument_token, from_date, to_date, interval)
            logging.info(f"Fetched {len(records)} historical candles.")
            return records
        except Exception as e:
            logging.error(f"[ERROR] Error fetching historical data: {e}")
            return []

    def place_order(self, symbol, exchange, transaction_type, quantity, order_type="MARKET", price=0.0, trigger_price=0.0):
        """
        Places a Buy/Sell order.
        transaction_type: 'BUY' or 'SELL'
        order_type: 'MARKET', 'LIMIT', 'SL', 'SL-M'
        """
        try:
            t_type = self.kite.TRANSACTION_TYPE_BUY if transaction_type.upper() == "BUY" else self.kite.TRANSACTION_TYPE_SELL
            p_type = self.kite.PRODUCT_MIS if config.PRODUCT_TYPE == "MIS" else self.kite.PRODUCT_CNC
            
            o_type = self.kite.ORDER_TYPE_MARKET
            if order_type.upper() == "LIMIT":
                o_type = self.kite.ORDER_TYPE_LIMIT
            elif order_type.upper() == "SL":
                o_type = self.kite.ORDER_TYPE_SL
            elif order_type.upper() == "SL-M":
                o_type = self.kite.ORDER_TYPE_SLM

            order_id = self.kite.place_order(
                variety=self.kite.VARIETY_REGULAR,
                exchange=exchange,
                tradingsymbol=symbol,
                transaction_type=t_type,
                quantity=quantity,
                product=p_type,
                order_type=o_type,
                price=price if o_type == self.kite.ORDER_TYPE_LIMIT else None,
                trigger_price=trigger_price if o_type in [self.kite.ORDER_TYPE_SL, self.kite.ORDER_TYPE_SLM] else None
            )
            logging.info(f"[ORDER] {transaction_type} Order Executed! Order ID: {order_id}")
            return order_id
        except Exception as e:
            logging.error(f"[ERROR] Order placement error: {e}")
            return None

    def get_open_positions(self):
        """Returns currently active positions."""
        try:
            positions = self.kite.positions()
            return positions.get("net", [])
        except Exception as e:
            logging.error(f"[ERROR] Error fetching positions: {e}")
            return []
