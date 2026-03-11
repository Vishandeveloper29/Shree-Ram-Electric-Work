require('dotenv').config({path:__dirname + "/.env"})
const express = require('express');
const cors = require('cors');
const connectDB = require('./connection');
const routes = require('./routes');
const seed = require('./seed');
const app = express(); 

// Connect to MongoDB
connectDB();
console.log(process.env.ADMIN_PASSWORD)
// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
seed()
// Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '⚡ Shree Ram Electric Works API is running.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
