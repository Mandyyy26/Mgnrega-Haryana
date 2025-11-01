import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import express from 'express';
import dotenv from 'dotenv';
import logger from '../lib/logger';
import { ingestAllData } from '../scripts/fetch_ogd_data';

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
  lastError: string | null;
  recordsIngested: number;
}

const jobStatus: CronJobStatus = {
  jobId: 'mgnrega-monthly-ingest',
  isRunning: false,
  lastRunTime: null,
  lastRunStatus: null,
  totalRuns: 0,
  failedRuns: 0,
  nextRunTime: null,
  lastError: null,
  recordsIngested: 0,
};

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
  jobStatus.lastRunStatus = 'RUNNING';
  const startTime = Date.now();
  jobStatus.totalRuns += 1;

  logger.info('🚀 Monthly ingestion job STARTED', {
    runNumber: jobStatus.totalRuns,
    timestamp: new Date().toISOString(),
    schedule: process.env.CRON_SCHEDULE,
  });

  try {
    // Call your ingestion function
    logger.info('📥 Calling ingestAllData()...');
    await ingestAllData();

    const duration = Date.now() - startTime;
    jobStatus.lastRunTime = new Date();
    jobStatus.lastRunStatus = 'SUCCESS';
    jobStatus.lastError = null;

    logger.info('✅ Monthly ingestion job COMPLETED', {
      durationMs: duration,
      durationSec: (duration / 1000).toFixed(2),
      timestamp: new Date().toISOString(),
      jobStatus,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    jobStatus.lastRunTime = new Date();
    jobStatus.lastRunStatus = 'FAILED';
    jobStatus.failedRuns += 1;
    jobStatus.lastError = errorMessage;

    logger.error('❌ Monthly ingestion job FAILED', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
      failureCount: jobStatus.failedRuns,
      jobStatus,
    });
  } finally {
    jobStatus.isRunning = false;
  }
}

// ==========================================
// CALCULATE NEXT RUN TIME
// ==========================================

function calculateNextRunTime(): Date | null {
  try {
    const schedule = process.env.CRON_SCHEDULE || '0 2 1,15 * *';
    // This is a simple calculation - in production, use a cron parser library
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Approximate: next day
    return nextRun;
  } catch {
    return null;
  }
}

// ==========================================
// START CRON SCHEDULER
// ==========================================

function startCronScheduler(): ScheduledTask | null {
  try {
    const schedule = process.env.CRON_SCHEDULE || '0 2 1,15 * *';

    logger.info('⏰ Starting monthly ingestion scheduler', {
      schedule,
      description: 'Runs at 2:00 AM on 1st and 15th of every month',
    });

    const task = cron.schedule(schedule, monthlyIngestionTask);

    jobStatus.nextRunTime = calculateNextRunTime();

    logger.info('✅ Scheduler STARTED SUCCESSFULLY', {
      status: 'ACTIVE',
      schedule,
      nextRunTime: jobStatus.nextRunTime,
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
    service: 'mgnrega-ingestion-scheduler',
    timestamp: new Date().toISOString(),
    port: PORT,
    jobStatus,
  });
});

// Get cron job status
app.get('/status', (req, res) => {
  res.json({
    ...jobStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Manually trigger ingestion
app.post('/trigger', async (req, res) => {
  try {
    logger.info('📌 Manual ingestion triggered via API');

    if (jobStatus.isRunning) {
      return res.status(409).json({
        error: 'Ingestion job already running',
        message: 'Wait for the current job to complete',
      });
    }

    // Run ingestion in background (non-blocking)
    monthlyIngestionTask()
      .then(() => {
        logger.info('✅ Triggered ingestion completed successfully');
      })
      .catch((err) => {
        logger.error('❌ Triggered ingestion failed:', err);
      });

    res.json({
      message: 'Ingestion triggered successfully',
      status: 'STARTED',
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

// Get detailed statistics
app.get('/stats', async (req, res) => {
  res.json({
    scheduler: {
      status: jobStatus.isRunning ? 'RUNNING' : 'IDLE',
      totalRuns: jobStatus.totalRuns,
      successfulRuns: jobStatus.totalRuns - jobStatus.failedRuns,
      failedRuns: jobStatus.failedRuns,
      successRate:
        jobStatus.totalRuns > 0
          ? (
              ((jobStatus.totalRuns - jobStatus.failedRuns) /
                jobStatus.totalRuns) *
              100
            ).toFixed(2) + '%'
          : 'N/A',
    },
    lastRun: {
      time: jobStatus.lastRunTime,
      status: jobStatus.lastRunStatus,
      error: jobStatus.lastError,
    },
    nextRun: jobStatus.nextRunTime,
    schedule: process.env.CRON_SCHEDULE || '0 2 1,15 * *',
  });
});

// ==========================================
// START SERVER AND SCHEDULER
// ==========================================

let cronTask: ScheduledTask | null = null;

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
      info: 'Set ENABLE_SCHEDULER=true in .env to enable',
    });
  }

  // Print available endpoints
  logger.info('📍 Available Endpoints:', {
    health: `GET http://localhost:${PORT}/health`,
    status: `GET http://localhost:${PORT}/status`,
    stats: `GET http://localhost:${PORT}/stats`,
    trigger: `POST http://localhost:${PORT}/trigger`,
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
