const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const characterRoutes = require('./routes/characters');
const twistRoutes = require('./routes/twists');
const plotRoutes = require('./routes/plots');
const aiRoutes = require('./routes/ai');
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/twists', twistRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/ai', aiRoutes);
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
app.listen(PORT, () => {
  console.log(`Mythos server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Frontend served at: http://localhost:${PORT}`);
}); 