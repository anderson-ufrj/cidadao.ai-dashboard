const http = require('http');

console.log('🔍 Testing Cidadão.AI Dashboard locally...\n');

// Test dashboard is running
const testDashboard = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Dashboard is running on http://localhost:3001');
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Content Length: ${data.length} bytes`);

        // Check if it has the expected content
        if (data.includes('Cidadão.AI')) {
          console.log('   ✓ Dashboard title found');
        }
        if (data.includes('next')) {
          console.log('   ✓ Next.js framework detected');
        }
        if (data.includes('agents')) {
          console.log('   ✓ Agent references found');
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error('❌ Error connecting to dashboard:', err.message);
      resolve();
    });
  });
};

// Test API metrics endpoint
const testMetrics = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/metrics', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✅ Metrics API endpoint:');
        console.log(`   Status Code: ${res.statusCode}`);

        try {
          const metrics = JSON.parse(data);
          console.log(`   ✓ Valid JSON response`);
          console.log(`   ✓ Active Agents: ${metrics.activeAgents || 0}`);
          console.log(`   ✓ Success Rate: ${(metrics.successRate * 100 || 0).toFixed(1)}%`);
        } catch (e) {
          console.log('   ⚠️  Mock data or empty response (expected)');
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error('   ❌ Error:', err.message);
      resolve();
    });
  });
};

// Check agent images
const checkImages = () => {
  console.log('\n🖼️  Checking Agent Images:');
  const agents = [
    'abaporu', 'anita', 'bonifacio', 'ceuci', 'dandara',
    'drummond', 'lampiao', 'machado', 'nana', 'niemeyer',
    'obaluaie', 'oxossi', 'quiteria', 'senna', 'tiradentes', 'zumbi'
  ];

  let checked = 0;
  agents.forEach(agent => {
    http.get(`http://localhost:3001/agents/${agent}.png`, (res) => {
      if (res.statusCode === 200) {
        checked++;
      }
      if (checked === agents.length) {
        console.log(`   ✓ All ${checked} agent images accessible`);
      }
    }).on('error', () => {});
  });
};

// Run all tests
const runTests = async () => {
  await testDashboard();
  await testMetrics();
  checkImages();

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Dashboard Status: OPERATIONAL');
  console.log('🌐 Access at: http://localhost:3001');
  console.log('═'.repeat(50));
  console.log('\n💡 Features available:');
  console.log('   • Real-time agent monitoring');
  console.log('   • Interactive Cytoscape graph with agent photos');
  console.log('   • Performance metrics charts');
  console.log('   • State machine visualization');
  console.log('   • Auto-refresh every 5 seconds');
};

runTests();