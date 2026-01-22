import { Router } from 'express';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 * @returns {{ status: string }} Health status object
 */
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
