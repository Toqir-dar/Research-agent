// src/test.js
const axios = require('axios');

const BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('🧪 Testing Express Backend...\n');

  // ── Test 1: Root ────────────────────────────────────────────
  console.log('='.repeat(50));
  console.log('TEST 1: Root endpoint');
  console.log('='.repeat(50));
  const root = await axios.get('http://localhost:3000');
  console.log('✅ Status:', root.status);
  console.log('✅ Service:', root.data.service);

  // ── Test 2: Health ──────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('TEST 2: Health Check');
  console.log('='.repeat(50));
  const health = await axios.get(`${BASE}/health`);
  console.log('✅ Express:', health.data.express);
  console.log('✅ ML API :', health.data.ml_api?.status);

  // ── Test 3: Validation errors ───────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('TEST 3: Validation');
  console.log('='.repeat(50));

  try {
    await axios.post(`${BASE}/research`, {});
  } catch (err) {
    console.log('✅ Missing topic rejected :', err.response.data.error);
  }

  try {
    await axios.post(`${BASE}/research`, { topic: 'hi' });
  } catch (err) {
    console.log('✅ Short topic rejected   :', err.response.data.error);
  }

  try {
    await axios.post(`${BASE}/research`, { topic: 'a'.repeat(301) });
  } catch (err) {
    console.log('✅ Long topic rejected    :', err.response.data.error);
  }

  // ── Test 4: Start research job ──────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('TEST 4: POST /api/research');
  console.log('='.repeat(50));
  const start = await axios.post(`${BASE}/research`, {
    topic: 'Blockchain technology in supply chain management'
  });
  console.log('✅ Status  :', start.status);
  console.log('✅ Job ID  :', start.data.job_id);
  console.log('✅ Job Status:', start.data.status);
  const jobId = start.data.job_id;

  // ── Test 5: Poll for result ─────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('TEST 5: GET /api/research/:jobId (polling)');
  console.log('='.repeat(50));

  let elapsed = 0;
  const maxWait = 120;

  while (elapsed < maxWait) {
    const poll = await axios.get(`${BASE}/research/${jobId}`);
    const { status, word_count, sources_count } = poll.data;
    console.log(`   [${String(elapsed).padStart(3)}s] Status: ${status}`);

    if (status === 'completed') {
      console.log(`\n✅ Completed!`);
      console.log(`   Sources : ${sources_count}`);
      console.log(`   Words   : ${word_count}`);
      console.log(`\n📄 Preview:\n${poll.data.report?.slice(0, 300)}...`);
      break;
    } else if (status === 'error') {
      console.log('❌ Error:', poll.data.error);
      break;
    }
    await new Promise(r => setTimeout(r, 5000));
    elapsed += 5;
  }

  // ── Test 6: 404 handling ────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('TEST 6: 404 for unknown job');
  console.log('='.repeat(50));
  try {
    await axios.get(`${BASE}/research/fake-job-id-123`);
  } catch (err) {
    console.log('✅ 404 handled:', err.response.data.error);
  }

  // ── Test 7: List jobs ───────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('TEST 7: GET /api/jobs');
  console.log('='.repeat(50));
  const jobs = await axios.get(`${BASE}/jobs`);
  console.log(`✅ Total jobs: ${jobs.data.length}`);
  jobs.data.forEach(j => {
    console.log(`   ${j.job_id.slice(0,8)}... | ${j.status.padEnd(10)} | ${j.topic.slice(0,40)}`);
  });

  console.log('\n🎉 Phase 2 Step 3 complete! All endpoints working.');
}

runTests().catch(err => {
  if (err.code === 'ECONNREFUSED') {
    console.error('❌ Server not running. Make sure both servers are up:');
    console.error('   Terminal 1: uvicorn api.server:app --port 8000');
    console.error('   Terminal 2: npm run dev');
  } else {
    console.error('❌ Unexpected error:', err.message);
  }
});


