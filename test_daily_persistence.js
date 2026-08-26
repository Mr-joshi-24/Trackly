const http = require('http');

const API_BASE = 'http://localhost:5001/api';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runDailyTest() {
  console.log('=== STARTING DAILY TASKS & MOVEMENT PERSISTENCE TEST ===\n');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Create 3 Daily Routine Tasks
  console.log('1. Creating master daily routines...');
  const dt1 = await request('POST', '/daily-tasks', { title: 'Solve 1 LeetCode DSA Problem', category: 'Coding' });
  const dt2 = await request('POST', '/daily-tasks', { title: '30 Minutes Exercise / Workout', category: 'Health' });
  const dt3 = await request('POST', '/daily-tasks', { title: 'Apply to 2 Tech Roles', category: 'Career' });

  console.log(`   Daily Routine 1 ID: ${dt1.data.data?.id} (${dt1.data.data?.title})`);
  console.log(`   Daily Routine 2 ID: ${dt2.data.data?.id} (${dt2.data.data?.title})`);
  console.log(`   Daily Routine 3 ID: ${dt3.data.data?.id} (${dt3.data.data?.title})`);

  // 2. Toggle completion for today
  console.log(`\n2. Logging completion status for today (${todayStr})...`);
  await request('POST', '/daily-tasks/toggle', { daily_task_id: dt1.data.data.id, date: todayStr });
  await request('POST', '/daily-tasks/toggle', { daily_task_id: dt3.data.data.id, date: todayStr });

  // 3. Verify state for today
  console.log('\n3. Verifying initial daily state for today...');
  const resToday = await request('GET', `/daily-tasks?date=${todayStr}`);
  console.log(`   Total Daily Tasks: ${resToday.data.data.length}`);
  const completedToday = resToday.data.data.filter(t => t.completed === 1);
  console.log(`   Completed Items Today: ${completedToday.map(t => t.title).join(', ')}`);

  console.log('\nDaily Tasks testing complete! Ready for hard restart test.');
}

runDailyTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
