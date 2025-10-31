import cron from 'node-cron';
import express from 'express';
import dotenv from 'dotenv';
import logger from '../lib/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ==========================================
// JOB STATUS TRACKING
// ==========================================

interface CronJobStatus {
  jobId: string;
  isRunning: boolean;
  lastRunTime: Date | null;
  lastRunStatus: 'SUCCESS' | 'FAILED' | 'RUNNING' | null;
  totalRuns: number;
  failedRuns: number;
  nextRunTime: Date | null;
}

const jobStatus: CronJobStatus = {
  jobId: 'mgnrega-monthly-ingest',
  isRunning: false,
  lastRunTime: null,
  lastRunStatus: null,
  totalRuns: 0,
  failedRuns: 0,
  nextRunTime: null,
};

// ==========================================
// INGESTION TASK (Replace with your logic)
// ==========================================

async function performIngestion(): Promise<void> {
  logger.info('📥 Running data ingestion...');
  // TODO: Add your actual ingestion logic here
  // Example:
  // await ingestAllData();
  logger.info('✅ Data ingestion completed');
}

// ==========================================
// MONTHLY INGESTION TASK
// ==========================================

async function monthlyIngestionTask(): Promise<void> {
  // Prevent concurrent runs
  if (jobStatus.isRunning) {
    logger.warn(`⚠️ Ingestion job is already running. Skipping execution.`);
    return;
  }

  jobStatus.isRunning = true;
  const startTime = Date.now();
  jobStatus.totalRuns += 1;

  logger.info('🚀 Monthly ingestion job STARTED', {
    runNumber: jobStatus.totalRuns,
    timestamp: new Date().toISOString(),
    schedule: process.env.CRON_SCHEDULE,
  });

  try {
    // Run the ingestion
    await performIngestion();

    const duration = Date.now() - startTime;
    jobStatus.lastRunTime = new Date();
    jobStatus.lastRunStatus = 'SUCCESS';

    logger.info('✅ Monthly ingestion job COMPLETED', {
      durationMs: duration,
      durationSec: (duration / 1000).toFixed(2),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    jobStatus.lastRunTime = new Date();
    jobStatus.lastRunStatus = 'FAILED';
    jobStatus.failedRuns += 1;

    logger.error('❌ Monthly ingestion job FAILED', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
      failureCount: jobStatus.failedRuns,
    });
  } finally {
    jobStatus.isRunning = false;
  }
}

// ==========================================
// START CRON SCHEDULER
// ==========================================

function startCronScheduler(): import('node-cron').ScheduledTask | null {
  try {
    const schedule = process.env.CRON_SCHEDULE || '0 2 1,15 * *';

    logger.info('⏰ Starting monthly ingestion scheduler', {
      schedule,
      description: 'Runs at 2:00 AM on 1st and 15th of every month',
    });

    const task = cron.schedule(schedule, monthlyIngestionTask);

    logger.info('✅ Scheduler STARTED SUCCESSFULLY', {
      status: 'ACTIVE',
      schedule,
    });

    return task;
  } catch (error) {
    logger.error('❌ Failed to start scheduler', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ==========================================
// EXPRESS ROUTES
// ==========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'mgnrega-ingestion',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Get cron job status
app.get('/status', (req, res) => {
  res.json(jobStatus);
});

// Manually trigger ingestion
app.post('/trigger', async (req, res) => {
  try {
    logger.info('📌 Manual ingestion triggered');
    await monthlyIngestionTask();
    res.json({ 
      message: 'Ingestion triggered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error triggering ingestion', { error });
    res.status(500).json({
      error: 'Failed to trigger ingestion',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ==========================================
// START SERVER AND SCHEDULER
// ==========================================

let cronTask: ReturnType<typeof cron.schedule> | null = null;

const server = app.listen(PORT, () => {
  logger.info('🚀 INGESTION SERVICE STARTED', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });

  // Start cron scheduler
  if (process.env.ENABLE_SCHEDULER === 'true') {
    cronTask = startCronScheduler();
  } else {
    logger.info('ℹ️ Scheduler DISABLED', {
      info: 'Set ENABLE_SCHEDULER=true to enable',
    });
  }

  // Print available endpoints
  logger.info('📍 Available Endpoints:', {
    health: 'GET http://localhost:3001/health',
    status: 'GET http://localhost:3001/status',
    trigger: 'POST http://localhost:3001/trigger',
  });
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

function gracefulShutdown(signal: string) {
  logger.info(`📍 ${signal} received, shutting down gracefully...`);
  
  if (cronTask) {
    cronTask.stop();
    logger.info('⏹️ Cron scheduler stopped');
  }
  
  server.close(() => {
    logger.info('✅ Server closed successfully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('❌ Unhandled Rejection', { error });
  process.exit(1);
});

export default app;
