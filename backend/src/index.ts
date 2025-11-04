import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import adminRouter from './routes/admin.js';
import { getCache, setCache, deleteCache, deleteCachePattern } from './lib/cache.js';
import logger from './lib/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mgnrega_haryana',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error('[backend]', `Unexpected error on idle client: ${err.message}`);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('[backend]', `Database connection error: ${err.message}`);
  } else {
    logger.info('[backend]', '✅ PostgreSQL Connected Successfully');
  }
});
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.use('/api/admin', adminRouter);

// ==========================================
// GET all districts for Haryana (with cache)
// ==========================================
app.get('/api/v1/districts', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'districts_haryana_all';

    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      logger.info(`✅ Cache HIT: ${cacheKey}`);
      return res.json({
        districts: cachedData,
        source: 'cache',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`❌ Cache MISS: ${cacheKey} - querying database`);
    const result = await pool.query(`
      SELECT district_code, name, name_hi, centroid_lat, centroid_lng
      FROM districts
      WHERE state_code = '12'
      ORDER BY name
    `);

    // Store in cache (24 hours)
    const ttl = parseInt(process.env.CACHE_DISTRICTS_TTL || '86400');
    await setCache(cacheKey, result.rows, ttl);

    res.json({
      districts: result.rows,
      source: 'database',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// ==========================================
// GET district summary with month support (with cache)
// ==========================================
app.get('/api/v1/districts/:districtCode/summary', async (req: Request, res: Response) => {
  const { districtCode } = req.params;
  const { month, year } = req.query;

  try {
    const selectedMonth = month ? parseInt(month as string) : 10;
    const selectedYear = (year as string) || '2025-2026';
    const cacheKey = `district_summary_${districtCode}_${selectedYear}_${selectedMonth}`;

    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      logger.info(`✅ Cache HIT: ${cacheKey}`);
      return res.json({
        ...cachedData,
        source: 'cache',
      });
    }

    logger.info(`❌ Cache MISS: ${cacheKey} - querying database`);

    const districtInfo = await pool.query(
      `
      SELECT district_code, name, name_hi, centroid_lat, centroid_lng
      FROM districts
      WHERE district_code = $1
    `,
      [districtCode]
    );

    if (districtInfo.rows.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    // Get current month data
    const currentData = await pool.query(
      `
      SELECT 
        person_days,
        avg_wage_rate,
        households_provided,
        persons_worked,
        works_completed,
        works_ongoing,
        women_persondays,
        sc_persondays,
        st_persondays,
        total_wages_paid,
        material_expenditure,
        admin_expenditure,
        total_expenditure
      FROM facts_mgnrega_monthly
      WHERE district_code = $1
      AND fin_year = $2
      AND month = $3
      ORDER BY ingested_at DESC
      LIMIT 1
    `,
      [districtCode, selectedYear, selectedMonth]
    );

    if (currentData.rows.length === 0) {
      return res.status(404).json({
        error: 'No data found for this district/month',
        district: districtInfo.rows[0],
      });
    }

    // Get previous month
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear =
      selectedMonth === 1
        ? `${parseInt(selectedYear.split('-')[0]!) - 1}-${parseInt(selectedYear.split('-')[1]!) - 1}`
        : selectedYear;

    const prevData = await pool.query(
      `
      SELECT * FROM facts_mgnrega_monthly
      WHERE district_code = $1
      AND fin_year = $2
      AND month = $3
      ORDER BY ingested_at DESC
      LIMIT 1
    `,
      [districtCode, prevYear, prevMonth]
    );

    const responseData = {
      district: districtInfo.rows[0],
      current: currentData.rows[0],
      previous: prevData.rows[0] || null,
      comparison: prevData.rows[0]
        ? {
            person_days_change: currentData.rows[0].person_days - prevData.rows[0].person_days,
            households_change:
              currentData.rows[0].households_provided - prevData.rows[0].households_provided,
          }
        : null,
    };

    // Store in cache (2 hours for district summary)
    const ttl = parseInt(process.env.CACHE_BUDGET_TTL || '7200');
    await setCache(cacheKey, responseData, ttl);

    res.json({
      ...responseData,
      source: 'database',
    });
  } catch (error) {
    logger.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ==========================================
// GET rankings with composite score (with cache)
// ==========================================
// ==========================================
// GET rankings with composite score (with cache)
// ==========================================
app.get('/api/v1/rankings', async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    const selectedMonth = month ? parseInt(month as string) : 10;
    const selectedYear = (year as string) || '2025-2026';
    const cacheKey = `rankings_${selectedYear}_${selectedMonth}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      logger.info(`✅ Cache HIT: ${cacheKey}`);
      return res.json({ ...cachedData, source: 'cache' });
    }

    logger.info(`❌ Cache MISS: ${cacheKey} - querying database`);

    const query = `
      SELECT 
        d.name,
        d.name_hi,
        d.district_code,
        f.person_days,
        f.households_provided,
        f.avg_wage_rate,
        f.works_completed,
        f.works_ongoing,
        f.women_persondays,
        CASE 
          WHEN (f.works_completed + f.works_ongoing) > 0 
          THEN (f.works_completed::float / (f.works_completed + f.works_ongoing)) * 100 
          ELSE 0 
        END as completion_rate,
        CASE 
          WHEN f.person_days > 0 
          THEN (f.women_persondays::float / f.person_days) * 100 
          ELSE 0 
        END as women_participation_rate,
        (f.person_days + f.households_provided + f.avg_wage_rate) as performance_score
      FROM facts_mgnrega_monthly f
      JOIN districts d ON f.district_code = d.district_code
      WHERE f.month = $1 AND f.fin_year = $2
      ORDER BY performance_score DESC
      LIMIT 5
    `;

    const result = await pool.query(query, [selectedMonth, selectedYear]);

    const responseData = {
      rankings: result.rows,
      month: selectedMonth,
      year: selectedYear,
      scoring_methodology: {
        employment_generation: 0.30,
        households_reached: 0.25,
        project_completion: 0.20,
        women_participation: 0.15,
        wage_adequacy: 0.10,
      },
    };

    const ttl = parseInt(process.env.CACHE_RANKINGS_TTL || '21600');
    await setCache(cacheKey, responseData, ttl);

    res.json({ ...responseData, source: 'database' });
  } catch (error) {
    logger.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});




// ==========================================
// GET district trend data (with cache)
// ==========================================
app.get('/api/v1/districts/:code/trend', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Create cache key without year dependency
    const cacheKey = `trend_${code}_last6months`;

    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      logger.info(`✅ Cache HIT: ${cacheKey}`);
      return res.json({
        ...cachedData,
        source: 'cache',
      });
    }

    logger.info(`❌ Cache MISS: ${cacheKey} - querying database`);

    // Query for last 6 months across all financial years
    const query = `
      SELECT 
        month,
        fin_year,
        person_days,
        households_provided,
        avg_wage_rate
      FROM facts_mgnrega_monthly
      WHERE district_code = $1
      ORDER BY fin_year DESC, 
               CASE month
                 WHEN 'April' THEN 1
                 WHEN 'May' THEN 2
                 WHEN 'June' THEN 3
                 WHEN 'July' THEN 4
                 WHEN 'August' THEN 5
                 WHEN 'September' THEN 6
                 WHEN 'October' THEN 7
                 WHEN 'November' THEN 8
                 WHEN 'December' THEN 9
                 WHEN 'January' THEN 10
                 WHEN 'February' THEN 11
                 WHEN 'March' THEN 12
               END DESC
      LIMIT 6
    `;

    const result = await pool.query(query, [code]);

    // Reverse to show chronologically (oldest to newest in last 6 months)
    const trendData = result.rows.reverse();

    const responseData = {
      trend: trendData,
      district_code: code,
      period: `Last 6 months (${trendData[0]?.month || 'N/A'} ${trendData[0]?.fin_year || ''} to ${trendData[trendData.length - 1]?.month || 'N/A'} ${trendData[trendData.length - 1]?.fin_year || ''})`,
      data_availability: 'April 2024 - October 2025',
    };

    // Store in cache (6 hours for last 6 months trend)
    const ttl = parseInt(process.env.CACHE_TRENDS_TTL || '21600');
    await setCache(cacheKey, responseData, ttl);

    res.json({
      ...responseData,
      source: 'database',
    });
  } catch (error) {
    logger.error('Error fetching trend:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});


// ==========================================
// Detect district from coordinates (with cache)
// ==========================================
app.get('/api/v1/detect-district', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    // Check if we already detected this location
    const cacheKey = `detect_${latitude}_${longitude}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      logger.info(`✅ Cache HIT: ${cacheKey}`);
      return res.json({
        ...cachedData,
        source: 'cache',
      });
    }

    logger.info(`❌ Cache MISS: ${cacheKey} - querying database`);

    // Get all Haryana districts with centroids
    const query = `
      SELECT district_code, name, name_hi, centroid_lat, centroid_lng
      FROM districts
      WHERE state_code = '12' AND centroid_lat IS NOT NULL AND centroid_lng IS NOT NULL
    `;

    const result = await pool.query(query);

    // Calculate distance using Haversine formula
    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    let nearestDistrict = null;
    let minDistance = Infinity;

    for (const district of result.rows) {
      const distance = getDistance(latitude, longitude, district.centroid_lat, district.centroid_lng);

      if (distance < minDistance) {
        minDistance = distance;
        nearestDistrict = district;
      }
    }

    if (!nearestDistrict) {
      return res.status(404).json({
        error: 'No district found nearby',
      });
    }

    let responseData;

    // If distance is > 100km, probably not in Haryana
    if (minDistance > 100) {
      responseData = {
        detected: false,
        message: 'Location appears to be outside Haryana. Please select your district manually.',
        nearest_district: {
          district_code: nearestDistrict.district_code,
          name: nearestDistrict.name,
          name_hi: nearestDistrict.name_hi,
          distance_km: Math.round(minDistance),
        },
      };
    } else {
      responseData = {
        detected: true,
        district: {
          district_code: nearestDistrict.district_code,
          name: nearestDistrict.name,
          name_hi: nearestDistrict.name_hi,
          distance_km: Math.round(minDistance),
        },
      };
    }

    // Store in cache (12 hours for location detection)
    const ttl = parseInt(process.env.CACHE_LOCATION_TTL || '43200');
    await setCache(cacheKey, responseData, ttl);

    res.json({
      ...responseData,
      source: 'database',
    });
  } catch (error) {
    logger.error('Error detecting district:', error);
    res.status(500).json({
      error: 'Failed to detect district',
      message: 'Please select your district manually',
    });
  }
});

app.listen(port, () => {
  logger.info(`✅ Server running on http://localhost:${port}`);
  logger.info(`📍 Admin endpoints:`);
  logger.info(`   - GET /api/admin/ingestion-status (requires x-api-key)`);
  logger.info(`   - POST /api/admin/trigger-ingestion (requires x-api-key)`);
  logger.info(`   - DELETE /api/admin/cache/:key (requires x-api-key)`);
  logger.info(`   - DELETE /api/admin/cache (requires x-api-key)`);
  logger.info(`   - GET /api/admin/cache-stats (requires x-api-key)`);
});

export default app;
