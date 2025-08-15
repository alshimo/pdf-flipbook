const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Add some basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'PDF Flipbook server is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// PDF proxy endpoint to bypass CORS
app.get('/proxy/pdf', async (req, res) => {
  try {
    const pdfUrl = req.query.url;
    
    if (!pdfUrl) {
      return res.status(400).json({ error: 'PDF URL is required' });
    }
    
    console.log('Proxying PDF request to:', pdfUrl);
    
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDF-Flipbook/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.send(buffer);
    
  } catch (error) {
    console.error('PDF proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy PDF',
      details: error.message 
    });
  }
});

// Handle all routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PDF Flipbook server running on port ${PORT}`);
  console.log(`📖 Visit: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Railway URL: ${process.env.RAILWAY_STATIC_URL || 'Not set'}`);
  console.log(`🔧 Environment variables:`, {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
