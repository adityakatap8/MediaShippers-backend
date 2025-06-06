// api/index.js
import app from '../app.js';
import { createServer } from 'http';

export default async function handler(req, res) {
    await app(req, res);
}
