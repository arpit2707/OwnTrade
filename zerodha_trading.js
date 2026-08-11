const KiteConnect = require("kiteconnect").KiteConnect;

// ==========================================
# ZERODHA KITE CONNECT NODE.JS STARTER CODE
// ==========================================
const apiKey = "YOUR_API_KEY";
const apiSecret = "YOUR_API_SECRET";

const kc = new KiteConnect({
    api_key: apiKey
});

console.log("--- Zerodha KiteConnect Node.js Setup ---");
console.log("1. Login URL:", kc.getLoginUrl());

// Function to set session after getting request_token
function initSession(requestToken) {
    kc.generateSession(requestToken, apiSecret)
        .then((response) => {
            console.log("✅ Session response:", response);
            kc.setAccessToken(response.access_token);
            getProfile();
        })
        .catch((err) => {
            console.error("❌ Error initializing session:", err);
        });
}

function getProfile() {
    kc.getProfile()
        .then((profile) => {
            console.log("👤 Profile:", profile);
        })
        .catch((err) => {
            console.error("❌ Error fetching profile:", err);
        });
}
