#!/usr/bin/env node
/**
 * Key Validation Test Script
 * 
 * This script tests your Supabase configuration in both local and production environments.
 * 
 * Usage:
 *   node test-keys.js local    # Test local configuration
 *   node test-keys.js prod     # Test production deployment
 */

const environment = process.argv[2] || 'local';

console.log(`\n🔍 Testing ${environment.toUpperCase()} Environment Keys\n`);
console.log('='.repeat(60));

if (environment === 'local') {
  // Test local environment
  console.log('\n📋 Reading .dev.vars...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const devVarsPath = path.join(__dirname, '.dev.vars');
  
  if (!fs.existsSync(devVarsPath)) {
    console.error('❌ .dev.vars file not found!');
    console.log('   Create one with:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }
  
  const devVars = fs.readFileSync(devVarsPath, 'utf8');
  const lines = devVars.split('\n');
  
  let hasUrl = false;
  let hasAnonKey = false;
  let hasServiceKey = false;
  let url = '';
  
  lines.forEach(line => {
    if (line.startsWith('SUPABASE_URL=')) {
      hasUrl = true;
      url = line.split('=')[1];
      console.log('✅ SUPABASE_URL found:', url);
    }
    if (line.startsWith('SUPABASE_ANON_KEY=')) {
      hasAnonKey = true;
      const key = line.split('=')[1];
      console.log('✅ SUPABASE_ANON_KEY found:', key.substring(0, 20) + '...');
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      hasServiceKey = true;
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY found (will bypass RLS!)');
    }
  });
  
  console.log('\n📊 Configuration Status:\n');
  console.log(`   URL:             ${hasUrl ? '✅' : '❌'}`);
  console.log(`   ANON_KEY:        ${hasAnonKey ? '✅' : '❌'}`);
  console.log(`   SERVICE_ROLE_KEY: ${hasServiceKey ? '⚠️  YES (not recommended)' : '✅ NO (good)'}`);
  
  if (!hasUrl || !hasAnonKey) {
    console.log('\n❌ Missing required keys!');
    process.exit(1);
  }
  
  if (hasServiceKey) {
    console.log('\n⚠️  WARNING: SERVICE_ROLE_KEY is set!');
    console.log('   This will bypass Row Level Security (RLS) policies.');
    console.log('   Remove it unless you need admin operations.');
  }
  
  console.log('\n✅ Local configuration looks good!');
  console.log('\n💡 Test the local server:');
  console.log('   1. Run: wrangler dev --local');
  console.log('   2. Visit: http://127.0.0.1:8787/api/health');
  console.log('   3. Check the config in the response');
  
} else if (environment === 'prod') {
  // Test production environment
  console.log('\n📋 Checking production configuration...\n');
  
  const https = require('https');
  
  const prodUrl = 'https://trackifi-api.trackifi.workers.dev/api/health';
  
  console.log(`Testing: ${prodUrl}\n`);
  
  https.get(prodUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log('✅ Production server is responding\n');
        console.log('📊 Configuration Status:\n');
        console.log(`   Status:          ${response.status === 'ok' ? '✅' : '❌'}`);
        console.log(`   Supabase URL:    ${response.config.supabaseUrl}`);
        console.log(`   Has ANON_KEY:    ${response.config.hasAnonKey ? '✅' : '❌'}`);
        console.log(`   Has SERVICE_KEY: ${response.config.hasServiceKey ? '⚠️  YES' : '✅ NO'}`);
        console.log(`   Using:           ${response.config.usingKey}`);
        
        if (response.config.warning) {
          console.log(`\n⚠️  WARNING: ${response.config.warning}`);
        }
        
        if (!response.config.hasAnonKey) {
          console.log('\n❌ CRITICAL: SUPABASE_ANON_KEY is missing in production!');
          console.log('   Fix: Redeploy with corrected wrangler.toml');
        }
        
        if (response.config.hasServiceKey && response.config.hasAnonKey) {
          console.log('\n⚠️  You have both ANON_KEY and SERVICE_ROLE_KEY set.');
          console.log('   The system will use ANON_KEY (correct behavior).');
          console.log('   Consider removing SERVICE_ROLE_KEY to avoid confusion.');
        }
        
        console.log('\n✅ Production configuration check complete!');
        
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Failed to connect to production:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify the worker is deployed: wrangler deployments list');
    console.log('   2. Check the URL matches your worker name');
    console.log('   3. Ensure CORS is configured correctly');
  });
  
} else {
  console.log('❌ Invalid environment. Use "local" or "prod"');
  console.log('\nUsage:');
  console.log('   node test-keys.js local');
  console.log('   node test-keys.js prod');
  process.exit(1);
}

console.log('\n' + '='.repeat(60) + '\n');
