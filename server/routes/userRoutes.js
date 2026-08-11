const express = require('express');
const router = express.Router();
const { getKiteInstance, activeKiteSession, mockMargins } = require('../services/kiteService');

// Fetch User Margins (Equity & Commodity)
router.get('/margins', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const margins = await kc.getMargins();
      return res.json({ success: true, data: margins.data || margins });
    }
    // Fallback Mock Data for immediate demo
    res.json({ success: true, data: mockMargins, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: mockMargins, mode: 'simulated', warning: error.message });
  }
});

// Fetch User Profile
router.get('/profile', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const profile = await kc.getProfile();
      return res.json({ success: true, data: profile.data || profile });
    }
    res.json({
      success: true,
      data: activeKiteSession.user,
      mode: 'simulated'
    });
  } catch (error) {
    res.json({ success: true, data: activeKiteSession.user, mode: 'simulated', warning: error.message });
  }
});

module.exports = router;
