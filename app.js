const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const os = require('os');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Rate limit for serving video files
const videoRateLimitSegment = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500,
  message: 'Too many requests, Please try again leter.',
});

const videoRateLimitMpd = rateLimit({
  windowMs: 1 * 60 * 1000, // 10 minutes
  max: 6, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// Serve the DASH manifest file
app.get('/video.mpd', videoRateLimitMpd, (req, res) => {
  console.log('called for mpd');
  const filePath = path.join(__dirname, 'video', 'video.mpd');
  res.sendFile(filePath);
});

// Serve the DASH segment files
app.get('/video/:segment', videoRateLimitSegment, (req, res) => {
  console.log('called segment');
  const segment = req.params.segment;
  const filePath = path.join(__dirname, 'video', segment);
  res.sendFile(filePath);
});

// load balancer
app.get('/', (req, res) => {
  res.send(
    `[${new Date().toISOString()}] Received request on ${os.hostname()} from ${
      req.ip
    }`
  );
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
