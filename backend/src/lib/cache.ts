import { createClient } from 'redis';
import logger from './logger.js';

// Build Redis client config dynamically
const redisConfig: any = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};

// Only add password if it exists
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

// Create Redis client
const redisClient = createClient(redisConfig);

// Connect to Redis
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('✅ Redis Connected');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis Ready');
});

// Connect (async)
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
  }
})();

// ==========================================
// CACHE FUNCTIONS
// ==========================================

/**
 * Get value from cache
 */
export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      logger.debug(`✅ Cache HIT: ${key}`);
      return JSON.parse(data);
    }
    logger.debug(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Cache get error for key: ${key}`, error);
    return null;
  }
};

/**
 * Set value in cache with TTL (Time To Live)
 */
export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number = 3600
) => {
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    logger.debug(`📝 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    logger.error(`Cache set error for key: ${key}`, error);
  }
};

/**
 * Delete specific cache key
 */
export const deleteCache = async (key: string) => {
  try {
    await redisClient.del(key);
    logger.debug(`🗑️ Cache DELETED: ${key}`);
  } catch (error) {
    logger.error(`Cache delete error for key: ${key}`, error);
  }
};

/**
 * Delete multiple cache keys by pattern
 */
export const deleteCachePattern = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug(`🗑️ Cache DELETED ${keys.length} keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Cache delete pattern error: ${pattern}`, error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  try {
    await redisClient.flushAll();
    logger.info('🔥 All Cache CLEARED');
  } catch (error) {
    logger.error('Cache clear all error:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    const info = await redisClient.info('stats');
    return info;
  } catch (error) {
    logger.error('Cache stats error:', error);
    return null;
  }
};

export default redisClient;
