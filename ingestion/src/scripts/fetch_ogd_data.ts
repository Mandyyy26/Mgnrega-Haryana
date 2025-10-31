import axios from 'axios';
import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();


const OGD_API_KEY = process.env.OGD_API_KEY || '';
const RESOURCE_ID = process.env.OGD_RESOURCE_ID;


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});


interface MGNREGARecord {
  state_name: string;
  state_code: string;
  district_name: string;
  district_code: string;
  fin_year: string;
  month: string;
  Total_Households_Worked: string;
  Persondays_of_Central_Liability_so_far: string;
  Average_days_of_employment_provided_per_Household: string;
  Average_Wage_rate_per_day_per_person: string;
  Total_No_of_Works_Takenup: string;
  Number_of_Ongoing_Works: string;
  Number_of_Completed_Works: string;
  Women_Persondays: string;
  SC_persondays: string;
  ST_persondays: string;
  Wages: string;
  Material_and_skilled_Wages: string;
  Total_Adm_Expenditure: string;
  Total_Exp: string;
}


// Month mapping for both short and full names
const monthMap: { [key: string]: number } = {
  'Jan': 1, 'January': 1,
  'Feb': 2, 'February': 2,
  'Mar': 3, 'March': 3,
  'Apr': 4, 'April': 4,
  'May': 5,
  'Jun': 6, 'June': 6,
  'Jul': 7, 'July': 7,
  'Aug': 8, 'August': 8,
  'Sep': 9, 'September': 9,
  'Oct': 10, 'October': 10,
  'Nov': 11, 'November': 11,
  'Dec': 12, 'December': 12
};


/**
 * Fetch all data for a specific financial year
 */
async function fetchAllDataForYear(finYear: string): Promise<MGNREGARecord[]> {
  let offset = 0;
  const limit = 100;
  let allRecords: MGNREGARecord[] = [];
  let hasMore = true;


  console.log(`\n📥 Fetching all data for FY ${finYear}...`);


  while (hasMore) {
    try {
      const url = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
      
      const response = await axios.get(url, {
        params: {
          'api-key': OGD_API_KEY,
          format: 'json',
          offset,
          limit,
          'filters[state_name]': 'HARYANA',
          'filters[fin_year]': finYear
        },
        timeout: 30000
      });


      const records = response.data.records || [];
      allRecords = allRecords.concat(records);
      
      console.log(`  ✓ Fetched ${records.length} records (offset: ${offset}, total so far: ${allRecords.length})`);


      if (records.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }


      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));


    } catch (error: any) {
      console.error('❌ Error fetching data:', error.message);
      hasMore = false;
    }
  }


  console.log(`✅ Total records fetched for ${finYear}: ${allRecords.length}`);
  return allRecords;
}


/**
 * Deduplicate records by keeping the latest (highest Total_Exp) for each district-month
 */
function deduplicateRecords(records: MGNREGARecord[]): MGNREGARecord[] {
  console.log(`\n🔍 Deduplicating ${records.length} records...`);
  
  const uniqueRecords = new Map<string, MGNREGARecord>();


  for (const record of records) {
    // Create unique key: district_code + fin_year + month
    const key = `${record.district_code}_${record.fin_year}_${record.month}`;
    
    const existing = uniqueRecords.get(key);
    
    if (!existing) {
      // First record for this combination
      uniqueRecords.set(key, record);
    } else {
      // Compare Total_Exp to determine which is more recent
      const existingExp = parseFloat(existing.Total_Exp) || 0;
      const currentExp = parseFloat(record.Total_Exp) || 0;
      
      // Keep the record with higher Total_Exp (likely more recent/complete)
      if (currentExp > existingExp) {
        uniqueRecords.set(key, record);
      }
    }
  }


  const deduped = Array.from(uniqueRecords.values());
  console.log(`✅ Deduplicated to ${deduped.length} unique records`);
  console.log(`   Removed ${records.length - deduped.length} duplicate records`);
  
  return deduped;
}


/**
 * Insert a single record into the database
 */
async function insertRecord(record: MGNREGARecord): Promise<void> {
  const query = `
    INSERT INTO facts_mgnrega_monthly (
      state_code, district_code, fin_year, month,
      households_demanded, households_provided, person_days,
      avg_days_per_household, avg_wage_rate,
      works_started, works_ongoing, works_completed,
      women_persondays, sc_persondays, st_persondays,
      total_wages_paid, material_expenditure, admin_expenditure, total_expenditure,
      pending_wage_amount,
      data_source, source_url, ingested_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
    ON CONFLICT (district_code, fin_year, month) 
    DO UPDATE SET
      households_provided = EXCLUDED.households_provided,
      person_days = EXCLUDED.person_days,
      avg_days_per_household = EXCLUDED.avg_days_per_household,
      avg_wage_rate = EXCLUDED.avg_wage_rate,
      works_started = EXCLUDED.works_started,
      works_ongoing = EXCLUDED.works_ongoing,
      works_completed = EXCLUDED.works_completed,
      women_persondays = EXCLUDED.women_persondays,
      sc_persondays = EXCLUDED.sc_persondays,
      st_persondays = EXCLUDED.st_persondays,
      total_wages_paid = EXCLUDED.total_wages_paid,
      material_expenditure = EXCLUDED.material_expenditure,
      admin_expenditure = EXCLUDED.admin_expenditure,
      total_expenditure = EXCLUDED.total_expenditure,
      pending_wage_amount = EXCLUDED.pending_wage_amount,
      ingested_at = NOW()
  `;


  const monthNumber = monthMap[record.month] || 1;


  try {
    await pool.query(query, [
      record.state_code || '12',                                    // $1: state_code
      record.district_code,                                         // $2: district_code
      record.fin_year,                                              // $3: fin_year
      monthNumber,                                                  // $4: month
      null,                                                         // $5: households_demanded (not in dataset)
      parseInt(record.Total_Households_Worked) || 0,               // $6: households_provided
      parseFloat(record.Persondays_of_Central_Liability_so_far) || 0, // $7: person_days
      parseInt(record.Average_days_of_employment_provided_per_Household) || 0, // $8: avg_days_per_household
      parseFloat(record.Average_Wage_rate_per_day_per_person) || 0, // $9: avg_wage_rate
      parseInt(record.Total_No_of_Works_Takenup) || 0,             // $10: works_started
      parseInt(record.Number_of_Ongoing_Works) || 0,               // $11: works_ongoing
      parseInt(record.Number_of_Completed_Works) || 0,             // $12: works_completed
      parseFloat(record.Women_Persondays) || 0,                    // $13: women_persondays
      parseFloat(record.SC_persondays) || 0,                       // $14: sc_persondays
      parseFloat(record.ST_persondays) || 0,                       // $15: st_persondays
      parseFloat(record.Wages) || 0,                               // $16: total_wages_paid (NEW)
      parseFloat(record.Material_and_skilled_Wages) || 0,          // $17: material_expenditure (NEW)
      parseFloat(record.Total_Adm_Expenditure) || 0,               // $18: admin_expenditure (NEW)
      parseFloat(record.Total_Exp) || 0,                           // $19: total_expenditure (NEW)
      0,                                                            // $20: pending_wage_amount (not in this dataset)
      'OGD',                                                        // $21: data_source
      `https://api.data.gov.in/resource/${RESOURCE_ID}`            // $22: source_url
    ]);
  } catch (error: any) {
    console.error(`  ✗ Error inserting ${record.district_name} (${record.month}):`, error.message);
    throw error;
  }
}


/**
 * Insert records in batches for better performance
 */
async function insertRecordsBatch(records: MGNREGARecord[]): Promise<void> {
  console.log(`\n💾 Inserting ${records.length} records into database...`);
  
  let successCount = 0;
  let errorCount = 0;


  for (const record of records) {
    try {
      await insertRecord(record);
      successCount++;
      console.log(`  ✓ [${successCount}/${records.length}] ${record.district_name} - ${record.month} ${record.fin_year}`);
    } catch (error) {
      errorCount++;
      console.error(`  ✗ [Error ${errorCount}] Failed: ${record.district_name} - ${record.month}`);
    }
  }


  console.log(`\n📊 Insertion Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}


/**
 * Main ingestion function for multiple financial years
 */
async function ingestAllData(): Promise<void> {
  console.log('🚀 Starting MGNREGA data ingestion for Haryana...\n');


  const financialYears = ['2024-2025', '2025-2026'];
  
  try {
    for (const finYear of financialYears) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📅 Processing Financial Year: ${finYear}`);
      console.log(`${'='.repeat(60)}`);


      // Step 1: Fetch all records for the year
      const allRecords = await fetchAllDataForYear(finYear);


      if (allRecords.length === 0) {
        console.log(`⚠️  No records found for ${finYear}`);
        continue;
      }


      // Step 2: Deduplicate records (keep latest for each district-month)
      const uniqueRecords = deduplicateRecords(allRecords);


      // Step 3: Insert deduplicated records into database
      await insertRecordsBatch(uniqueRecords);


      console.log(`\n✅ Completed processing for ${finYear}`);
    }


    console.log('\n' + '='.repeat(60));
    console.log('🎉 All data ingestion complete!');
    console.log('='.repeat(60));


  } catch (error) {
    console.error('❌ Error in ingestion process:', error);
  } finally {
    await pool.end();
  }
}


/**
 * Utility function to show statistics of current data
 */
async function showDataStatistics(): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT 
        fin_year,
        COUNT(*) as total_records,
        COUNT(DISTINCT district_code) as unique_districts,
        COUNT(DISTINCT month) as unique_months,
        ROUND(AVG(total_expenditure::numeric), 2) as avg_expenditure,
        ROUND(AVG(total_wages_paid::numeric), 2) as avg_wages
      FROM facts_mgnrega_monthly
      WHERE state_code = '12'
      GROUP BY fin_year
      ORDER BY fin_year DESC
    `);


    console.log('\n📊 Current Database Statistics:');
    console.log(result.rows);
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
}


// Run if called directly
if (require.main === module) {
  ingestAllData()
    .then(() => showDataStatistics())
    .catch(console.error);
}


export { fetchAllDataForYear, deduplicateRecords, ingestAllData };
