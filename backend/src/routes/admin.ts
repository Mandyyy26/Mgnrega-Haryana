import express from 'express';
import logger from '../lib/logger.js';
import { deleteCache, clearAllCache, deleteCachePattern } from '../lib/cache.js';

const router = express.Router();

// Admin authentication middleware
const adminAuth = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    logger.warn(`Unauthorized admin access attempt with key: ${apiKey}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ==========================================
// Get cron job status from ingestion service
// ==========================================
router.get('/ingestion-status', adminAuth, async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/status');
    if (!response.ok) {
      logger.error('Ingestion service unavailable');
      return res.status(503).json({
        error: 'Ingestion service unavailable',
      });
    }
    const status = await response.json();
    logger.info('✅ Retrieved ingestion status');
    res.json(status);
  } catch (error) {
    logger.error('Could not reach ingestion service:', error);
    res.status(500).json({
      error: 'Could not reach ingestion service',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ==========================================
// Trigger ingestion manually
// ==========================================
router.post('/trigger-ingestion', adminAuth, async (req,res) => {
  try {
    logger.info('🚀 Manual ingestion triggered');
    const response = await fetch('http://localhost:3002/trigger', {
      method: 'POST',
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    logger.error('Failed to trigger ingestion:', error);
    res.status(500).json({
      error: 'Failed to trigger ingestion',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ==========================================
// Delete specific cache key
// ==========================================
router.delete('/cache/:key', adminAuth, async (req,res) => {
  try {
    const { key } = req.params;
    await deleteCache(key);
    logger.info(`🗑️ Cache deleted: ${key}`);
    res.json({ message: `Cache key deleted: ${key}` });
  } catch (error) {
    logger.error(`Error deleting cache key ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to delete cache' });
  }
});

// ==========================================
// Clear all cache
// ==========================================
router.delete('/cache', adminAuth, async (req,res) => {
  try {
    await clearAllCache();
    logger.info('🔥 All cache cleared');
    res.json({ message: 'All cache cleared successfully' });
  } catch (error) {
    logger.error('Error clearing all cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// ==========================================
// Cache statistics
// ==========================================
router.get('/cache-stats', adminAuth, async (req,res) => {
  try {
    logger.info('📊 Cache stats requested');
    res.json({
      message: 'Cache statistics',
      note: 'Cache is active and running',
      ttl_settings: {
        districts: parseInt(process.env.CACHE_DISTRICTS_TTL || '86400'),
        schemes: parseInt(process.env.CACHE_SCHEMES_TTL || '86400'),
        rankings: parseInt(process.env.CACHE_RANKINGS_TTL || '21600'),
        budget: parseInt(process.env.CACHE_BUDGET_TTL || '7200'),
        trends: parseInt(process.env.CACHE_TRENDS_TTL || '3600'),
        location: parseInt(process.env.CACHE_LOCATION_TTL || '43200'),
      },
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// ==========================================
// Invalidate cache after data ingestion
// (Called by ingestion service)
// ==========================================
router.post('/refresh-after-ingestion', async (req,res) => {
  try {
    // Delete all relevant cache keys
    await deleteCache('districts_haryana_all');
    await deleteCachePattern('district_summary_*');
    await deleteCachePattern('rankings_*');
    await deleteCachePattern('trend_*');
    await deleteCachePattern('detect_*');

    logger.info('✅ Cache invalidated after data ingestion');
    res.json({ message: 'Cache invalidated successfully' });
  } catch (error) {
    logger.error('Error invalidating cache after ingestion:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

export default router;
