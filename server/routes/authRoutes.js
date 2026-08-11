const express = require('express');
const router = express.Router();
const { getLoginUrl, setSessionTokens, activeKiteSession } = require('../services/kiteService');
const { KiteConnect } = require('kiteconnect');
const KiteSession = require('../models/KiteSession');

// Get Login URL
router.get('/login-url', (req, res) => {
  const apiKey = req.query.api_key || process.env.KITE_API_KEY;
  const loginUrl = getLoginUrl(apiKey);
  res.json({ success: true, loginUrl, apiKey });
});

// Configure API Credentials
router.post('/config', async (req, res) => {
  const { apiKey, apiSecret } = req.body;
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, message: 'apiKey and apiSecret are required' });
  }
  process.env.KITE_API_KEY = apiKey;
  process.env.KITE_API_SECRET = apiSecret;
  activeKiteSession.apiKey = apiKey;
  activeKiteSession.apiSecret = apiSecret;

  res.json({ success: true, message: 'Kite API Credentials saved successfully', apiKey });
});

// OAuth Callback from Zerodha (Exchanges request_token for access_token)
router.get('/callback', async (req, res) => {
  const { request_token, status } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (status === 'error' || !request_token) {
    return res.redirect(`${clientUrl}?auth_status=failed`);
  }

  try {
    const apiKey = process.env.KITE_API_KEY;
    const apiSecret = process.env.KITE_API_SECRET;

    if (apiKey && apiSecret && apiKey !== 'your_kite_api_key_here') {
      const kc = new KiteConnect({ api_key: apiKey });
      const response = await kc.generateSession(request_token, apiSecret);

      setSessionTokens(apiKey, apiSecret, response.access_token, {
        user_id: response.user_id,
        user_name: response.user_name,
        email: response.email,
        user_type: response.user_type
      });

      // Save to MongoDB if connected
      try {
        await KiteSession.create({
          apiKey,
          apiSecret,
          accessToken: response.access_token,
          publicToken: response.public_token,
          userId: response.user_id,
          userName: response.user_name,
          userEmail: response.email,
          userType: response.user_type
        });
      } catch (dbErr) {
        console.warn('DB session save warning:', dbErr.message);
      }

      return res.redirect(`${clientUrl}?auth_status=success&user_id=${response.user_id}`);
    } else {
      // Mock login for demo
      setSessionTokens('demo_key', 'demo_secret', 'demo_access_token_' + Date.now(), {
        user_id: 'DEMO1234',
        user_name: 'Demo Trader (Simulated)',
        email: 'trader@owntrade.com',
        user_type: 'individual'
      });
      return res.redirect(`${clientUrl}?auth_status=success&user_id=DEMO1234&mode=simulated`);
    }
  } catch (error) {
    console.error('Session Generation Error:', error.message);
    res.redirect(`${clientUrl}?auth_status=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Get Current Auth Status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    authenticated: !!activeKiteSession.accessToken,
    apiKey: activeKiteSession.apiKey,
    user: activeKiteSession.user,
    mode: activeKiteSession.accessToken && activeKiteSession.accessToken.includes('demo') ? 'simulated' : 'live'
  });
});

// Logout
router.post('/logout', (req, res) => {
  activeKiteSession.accessToken = null;
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
