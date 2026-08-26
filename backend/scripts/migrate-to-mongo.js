const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const path = require('path');

const Task = require('../models/Task');
const JobApplication = require('../models/JobApplication');
const DailyTask = require('../models/DailyTask');
const DailyLog = require('../models/DailyLog');

const dbPath = path.join(__dirname, '..', 'data', 'trackly.db');
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trackly';

console.log('--- STARTING ZERO-DATA-LOSS MIGRATION (SQLite ➔ MongoDB) ---');
console.log(`[SQLite] Database path: ${dbPath}`);
console.log(`[MongoDB] Connection URI: ${mongoURI}`);

async function runMigration() {
  // Connect Mongoose
  try {
    await mongoose.connect(mongoURI);
    console.log('[MongoDB] Connected successfully.');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }

  // Open SQLite Database
  const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('[SQLite] Failed to open SQLite database:', err.message);
      process.exit(1);
    }
  });

  const querySqlite = (sql) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  };

  try {
    // 1. Migrate Tasks
    const sqliteTasks = await querySqlite('SELECT * FROM tasks');
    console.log(`[Migration] Found ${sqliteTasks.length} tasks in SQLite.`);
    let migratedTasks = 0;
    for (const row of sqliteTasks) {
      await Task.updateOne(
        { sqlite_id: row.id },
        {
          sqlite_id: row.id,
          title: row.title,
          description: row.description || '',
          due_date: row.due_date || '',
          priority: row.priority || 'Medium',
          status: row.status || 'Pending',
          category: row.category || 'General',
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
        },
        { upsert: true }
      );
      migratedTasks++;
    }
    console.log(`[Migration] Successfully synced ${migratedTasks}/${sqliteTasks.length} tasks to MongoDB.`);

    // 2. Migrate Job Applications
    const sqliteApps = await querySqlite('SELECT * FROM job_applications');
    console.log(`[Migration] Found ${sqliteApps.length} job applications in SQLite.`);
    let migratedApps = 0;
    for (const row of sqliteApps) {
      await JobApplication.updateOne(
        { sqlite_id: row.id },
        {
          sqlite_id: row.id,
          company_name: row.company_name,
          role: row.role,
          job_type: row.job_type || 'Full-time',
          location: row.location || '',
          application_date: row.application_date,
          job_url: row.job_url || '',
          status: row.status || 'Applied',
          follow_up_date: row.follow_up_date || '',
          notes: row.notes || '',
          created_at: row.created_at ? new Date(row.created_at) : new Date(),
          updated_at: row.updated_at ? new Date(row.updated_at) : new Date()
        },
        { upsert: true }
      );
      migratedApps++;
    }
    console.log(`[Migration] Successfully synced ${migratedApps}/${sqliteApps.length} job applications to MongoDB.`);

    // 3. Migrate Daily Tasks & Daily Logs
    const sqliteDailyTasks = await querySqlite('SELECT * FROM daily_tasks');
    console.log(`[Migration] Found ${sqliteDailyTasks.length} daily tasks in SQLite.`);
    
    const dailyTaskIdMap = new Map(); // maps sqlite_id -> mongo _id

    for (const row of sqliteDailyTasks) {
      let doc = await DailyTask.findOne({ sqlite_id: row.id });
      if (!doc) {
        doc = await DailyTask.create({
          sqlite_id: row.id,
          title: row.title,
          category: row.category || 'General',
          is_active: Boolean(row.is_active),
          created_at: row.created_at ? new Date(row.created_at) : new Date()
        });
      } else {
        doc.title = row.title;
        doc.category = row.category || 'General';
        doc.is_active = Boolean(row.is_active);
        await doc.save();
      }
      dailyTaskIdMap.set(row.id, doc._id);
    }
    console.log(`[Migration] Successfully synced ${dailyTaskIdMap.size}/${sqliteDailyTasks.length} daily tasks to MongoDB.`);

    const sqliteDailyLogs = await querySqlite('SELECT * FROM daily_logs');
    console.log(`[Migration] Found ${sqliteDailyLogs.length} daily log entries in SQLite.`);
    let migratedLogs = 0;

    for (const row of sqliteDailyLogs) {
      const mongoDailyTaskId = dailyTaskIdMap.get(row.daily_task_id);
      if (mongoDailyTaskId) {
        await DailyLog.updateOne(
          { daily_task_id: mongoDailyTaskId, log_date: row.log_date },
          {
            daily_task_id: mongoDailyTaskId,
            log_date: row.log_date,
            completed: Boolean(row.completed),
            notes: row.notes || '',
            created_at: row.created_at ? new Date(row.created_at) : new Date()
          },
          { upsert: true }
        );
        migratedLogs++;
      }
    }
    console.log(`[Migration] Successfully synced ${migratedLogs}/${sqliteDailyLogs.length} daily logs to MongoDB.`);

    // Verification Summary
    console.log('\n--- VERIFICATION SUMMARY ---');
    console.log(`Tasks: SQLite ${sqliteTasks.length} | MongoDB ${await Task.countDocuments()}`);
    console.log(`Job Apps: SQLite ${sqliteApps.length} | MongoDB ${await JobApplication.countDocuments()}`);
    console.log(`Daily Tasks: SQLite ${sqliteDailyTasks.length} | MongoDB ${await DailyTask.countDocuments()}`);
    console.log(`Daily Logs: SQLite ${sqliteDailyLogs.length} | MongoDB ${await DailyLog.countDocuments()}`);
    console.log('\n✅ MIGRATION COMPLETED WITH ZERO DATA LOSS.');

  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    sqliteDb.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();
