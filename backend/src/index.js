import express, {} from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mgnrega_haryana',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});
app.use(cors());
app.use(express.json());
// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});
// Get all districts for Haryana
app.get('/api/v1/districts', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT district_code, name, name_hi, centroid_lat, centroid_lng
      FROM districts
      WHERE state_code = '12'
      ORDER BY name
    `);
        res.json({ districts: result.rows });
    }
    catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
});
// Get district summary
app.get('/api/v1/districts/:districtCode/summary', async (req, res) => {
    const { districtCode } = req.params;
    const { month, year } = req.query; // format: month=10, year=2024-2025
    try {
        // Get current month data
        const currentData = await pool.query(`
      SELECT * FROM facts_mgnrega_monthly
      WHERE district_code = $1
      AND fin_year = $2
      AND month = $3
      ORDER BY ingested_at DESC
      LIMIT 1
    `, [districtCode, year || '2024-2025', month || new Date().getMonth() + 1]);
        if (currentData.rows.length === 0) {
            return res.status(404).json({ error: 'No data found for this district/month' });
        }
        // Get previous month for comparison (simplified)
        const prevMonth = parseInt(month || String(new Date().getMonth() + 1)) - 1 || 12;
        const prevData = await pool.query(`
      SELECT * FROM facts_mgnrega_monthly
      WHERE district_code = $1
      AND month = $2
      ORDER BY ingested_at DESC
      LIMIT 1
    `, [districtCode, prevMonth]);
        res.json({
            current: currentData.rows[0],
            previous: prevData.rows[0] || null,
            comparison: prevData.rows[0] ? {
                person_days_change: currentData.rows[0].person_days - prevData.rows[0].person_days,
                households_change: currentData.rows[0].households_provided - prevData.rows[0].households_provided,
            } : null
        });
    }
    catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});
app.get('/api/v1/rankings', async (req, res) => {
    try {
        const { month, year, metric } = req.query;
        const selectedMonth = month ? parseInt(month) : 9; // Default to September
        const selectedYear = year || '2024-2025';
        const selectedMetric = metric || 'person_days'; // Default metric
        const query = `
      SELECT 
        d.name,
        d.name_hi,
        d.district_code,
        f.person_days,
        f.households_provided,
        f.avg_wage_rate,
        f.works_completed
      FROM facts_mgnrega_monthly f
      JOIN districts d ON f.district_code = d.district_code
      WHERE f.month = $1 AND f.fin_year = $2
      ORDER BY f.${selectedMetric} DESC
      LIMIT 5
    `;
        const result = await pool.query(query, [selectedMonth, selectedYear]);
        res.json({
            rankings: result.rows,
            metric: selectedMetric,
            month: selectedMonth,
            year: selectedYear
        });
    }
    catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({ error: 'Failed to fetch rankings' });
    }
});
// Get district trend data
app.get('/api/v1/districts/:code/trend', async (req, res) => {
    try {
        const { code } = req.params;
        const { year } = req.query;
        const selectedYear = year || '2024-2025';
        const query = `
      SELECT 
        month,
        person_days,
        households_provided,
        avg_wage_rate
      FROM facts_mgnrega_monthly
      WHERE district_code = $1 AND fin_year = $2
      ORDER BY month ASC
    `;
        const result = await pool.query(query, [code, selectedYear]);
        res.json({
            trend: result.rows,
            district_code: code,
            year: selectedYear
        });
    }
    catch (error) {
        console.error('Error fetching trend:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});
// Detect district from coordinates
// Simpler version without PostGIS (Haversine formula)
app.get('/api/v1/detect-district', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        // Get all Haryana districts with centroids
        const query = `
      SELECT district_code, name, name_hi, centroid_lat, centroid_lng
      FROM districts
      WHERE state_code = '12' AND centroid_lat IS NOT NULL AND centroid_lng IS NOT NULL
    `;
        const result = await pool.query(query);
        // Calculate distance using Haversine formula
        function getDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
                error: 'No district found nearby'
            });
        }
        // If distance is > 100km, probably not in Haryana
        if (minDistance > 100) {
            return res.json({
                detected: false,
                message: 'Location appears to be outside Haryana. Please select your district manually.',
                nearest_district: {
                    district_code: nearestDistrict.district_code,
                    name: nearestDistrict.name,
                    name_hi: nearestDistrict.name_hi,
                    distance_km: Math.round(minDistance)
                }
            });
        }
        res.json({
            detected: true,
            district: {
                district_code: nearestDistrict.district_code,
                name: nearestDistrict.name,
                name_hi: nearestDistrict.name_hi,
                distance_km: Math.round(minDistance)
            }
        });
    }
    catch (error) {
        console.error('Error detecting district:', error);
        res.status(500).json({
            error: 'Failed to detect district',
            message: 'Please select your district manually'
        });
    }
});
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map