// api/index.js
import { createServer } from 'http';
import app from '../app.js';

// This is required to work with Vercel’s serverless functions
export default function handler(req, res) {
  return app(req, res);
}
