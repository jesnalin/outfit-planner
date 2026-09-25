import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleApiRequest } from './src/server/handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// High limit for base64 clothing photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API router
app.all('/api/*', async (req, res) => {
  const result = await handleApiRequest(req.path, req.method, req.body);
  res.status(result.status).json(result.data);
});

// Serve static assets from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Outfit Stylist Server running on port ${PORT}`);
});
