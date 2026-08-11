import os
from kiteconnect import KiteConnect

# ==========================================
# ZERODHA KITE CONNECT API STARTER CODE
# ==========================================
# Step 1: Replace with your Zerodha App credentials
API_KEY = "YOUR_API_KEY"
API_SECRET = "YOUR_API_SECRET"

# Initialize KiteConnect
kite = KiteConnect(api_key=API_KEY)

def generate_login_url():
    """Step 2: Open this URL in browser to login and get request_token."""
    print("1. Open the following URL in your browser to login:")
    print(kite.login_url())

def generate_session(request_token):
    """Step 3: Generate Access Token using request_token after login."""
    try:
        data = kite.generate_session(request_token, api_secret=API_SECRET)
        kite.set_access_token(data["access_token"])
        print("✅ Session generated successfully!")
        print("Access Token:", data["access_token"])
        return data
    except Exception as e:
        print("❌ Error generating session:", e)
        return None

def check_profile_and_margins():
    """Fetch profile and funds summary."""
    try:
        profile = kite.profile()
        margins = kite.margins()
        print(f"👤 Connected User: {profile.get('user_name')} ({profile.get('user_id')})")
        print(f"💰 Available Cash Margin: ₹{margins.get('equity', {}).get('available', {}).get('live_balance', 0)}")
    except Exception as e:
        print("❌ Error fetching profile:", e)

def place_sample_order(symbol="RELIANCE", exchange="NSE", qty=1, transaction_type="BUY"):
    """
    Place a Market Order.
    Transaction Types: kite.TRANSACTION_TYPE_BUY or kite.TRANSACTION_TYPE_SELL
    Order Types: kite.ORDER_TYPE_MARKET, kite.ORDER_TYPE_LIMIT
    Products: kite.PRODUCT_MIS (Intraday), kite.PRODUCT_CNC (Delivery)
    """
    try:
        order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=exchange,
            tradingsymbol=symbol,
            transaction_type=transaction_type,
            quantity=qty,
            product=kite.PRODUCT_CNC,
            order_type=kite.ORDER_TYPE_MARKET
        )
        print(f"🚀 Order placed successfully! Order ID: {order_id}")
        return order_id
    except Exception as e:
        print("❌ Order placement failed:", e)
        return None

if __name__ == "__main__":
    print("--- Zerodha KiteConnect Python Algorithmic Trading Setup ---")
    print("Replace YOUR_API_KEY and YOUR_API_SECRET with your Zerodha credentials.\n")
    generate_login_url()
