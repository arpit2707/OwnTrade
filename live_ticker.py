import logging
from kiteconnect import KiteTicker
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class LiveTickerStream:
    def __init__(self, api_key, access_token):
        self.kws = KiteTicker(api_key, access_token)
        self.subscribed_tokens = []

        # Register Callbacks
        self.kws.on_ticks = self.on_ticks
        self.kws.on_connect = self.on_connect
        self.kws.on_close = self.on_close
        self.kws.on_error = self.on_error

    def on_ticks(self, ws, ticks):
        """Callback when live price ticks arrive."""
        for tick in ticks:
            token = tick.get("instrument_token")
            last_price = tick.get("last_price")
            volume = tick.get("volume")
            logging.info(f"📈 TICK | Instrument: {token} | LTP: ₹{last_price} | Volume: {volume}")

    def on_connect(self, ws, response):
        """Callback when WebSocket connects successfully."""
        logging.info("⚡ Live WebSocket Connected Successfully!")
        if self.subscribed_tokens:
            ws.subscribe(self.subscribed_tokens)
            ws.set_mode(ws.MODE_FULL, self.subscribed_tokens)
            logging.info(f"📡 Subscribed to tokens: {self.subscribed_tokens}")

    def on_close(self, ws, code, reason):
        """Callback when connection closes."""
        logging.warning(f"🔌 WebSocket Connection Closed: {reason} (Code: {code})")

    def on_error(self, ws, code, reason):
        """Callback on error."""
        logging.error(f"❌ WebSocket Error: {reason} (Code: {code})")

    def start_stream(self, tokens):
        """Connects and starts listening for live ticks."""
        self.subscribed_tokens = tokens
        logging.info("Starting Live Market Data WebSocket Stream...")
        self.kws.connect(threaded=True)
