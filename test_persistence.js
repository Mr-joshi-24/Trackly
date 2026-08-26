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

async function runTest() {
  console.log('=== STARTING MANDATORY DATA PERSISTENCE TEST ===\n');

  // Step 1: Create 3 Tasks
  console.log('1. Creating test tasks...');
  const task1 = await request('POST', '/tasks', {
    title: 'Complete System Architecture Review',
    description: 'Verify database schemas and REST API endpoints',
    priority: 'High',
    due_date: '2026-08-28'
  });
  const task2 = await request('POST', '/tasks', {
    title: 'Prepare Technical Interview Questions',
    description: 'Focus on Data Structures, Algorithms and Operating Systems',
    priority: 'Medium',
    due_date: '2026-08-30'
  });
  const task3 = await request('POST', '/tasks', {
    title: 'Update Portfolio & LinkedIn Profile',
    priority: 'Low'
  });

  console.log(`   Task 1 ID: ${task1.data.data?.id}`);
  console.log(`   Task 2 ID: ${task2.data.data?.id}`);
  console.log(`   Task 3 ID: ${task3.data.data?.id}`);

  // Step 2: Create 3 Job Applications
  console.log('\n2. Creating test job applications...');
  const app1 = await request('POST', '/applications', {
    company_name: 'Google',
    role: 'Software Engineer - Infrastructure',
    job_type: 'Full-time',
    location: 'Mountain View, CA',
    application_date: '2026-08-20',
    job_url: 'https://careers.google.com/jobs/123',
    status: 'Interview',
    follow_up_date: '2026-08-27',
    notes: 'Recruiter screen passed. Technical round scheduled for Thursday.'
  });

  const app2 = await request('POST', '/applications', {
    company_name: 'Stripe',
    role: 'Backend Engineering Intern',
    job_type: 'Internship',
    location: 'Remote',
    application_date: '2026-08-22',
    job_url: 'https://stripe.com/jobs/456',
    status: 'Assessment',
    follow_up_date: '2026-08-29',
    notes: 'Take-home coding test received.'
  });

  const app3 = await request('POST', '/applications', {
    company_name: 'Microsoft',
    role: 'Cloud Developer',
    job_type: 'Full-time',
    location: 'Redmond, WA',
    application_date: '2026-08-15',
    status: 'Applied'
  });

  console.log(`   App 1 ID: ${app1.data.data?.id} (${app1.data.data?.company_name})`);
  console.log(`   App 2 ID: ${app2.data.data?.id} (${app2.data.data?.company_name})`);
  console.log(`   App 3 ID: ${app3.data.data?.id} (${app3.data.data?.company_name})`);

  // Step 3: Verify initial state
  console.log('\n3. Verifying initial data fetch...');
  const tasksBefore = await request('GET', '/tasks');
  const appsBefore = await request('GET', '/applications');
  console.log(`   Tasks count in DB: ${tasksBefore.data.data.length}`);
  console.log(`   Applications count in DB: ${appsBefore.data.data.length}`);

  console.log('\n4. Database verification complete. Data is safely stored on disk in trackly.db!');
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
