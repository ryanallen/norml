// Static file serving routes
import express from 'express';
import { resolveProjectPath } from '../adapters/files-server.js';

export const router = express.Router();

// Serve index.html at root
router.get('/', (req, res) => {
  res.sendFile(resolveProjectPath('index.html'));
}); 