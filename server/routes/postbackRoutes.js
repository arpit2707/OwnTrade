const express = require('express');
const router = express.Router();

let postbackLogs = [];

// Endpoint to receive order execution updates from Zerodha
router.post('/', (req, res) => {
  const postbackData = req.body;
  console.log('🔔 Received Kite Order Postback:', postbackData);

  const logEntry = {
    id: 'pb_' + Date.now(),
    receivedAt: new Date(),
    data: postbackData
  };

  postbackLogs.unshift(logEntry);
  if (postbackLogs.length > 50) postbackLogs.pop();

  res.status(200).send('OK');
});

// View recent postbacks
router.get('/logs', (req, res) => {
  res.json({ success: true, data: postbackLogs });
});

module.exports = router;
