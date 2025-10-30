const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function checkFabricStatus() {
  console.log('🔍 Checking Hyperledger Fabric Status...\n');

  // Accept either container_name or service name for CA to avoid false negatives on Windows
  const containerAliases = [
    ['orderer.example.com'],
    ['peer0.org1.example.com'],
    ['ca_peerOrg1', 'ca.org1.example.com'],
    ['cli']
  ];

  let containersRunning = 0;

  try {
    // Get running containers via docker CLI (no external deps)
    let runningNames = [];
    try {
      const output = execSync('docker ps --format "{{.Names}}"', { stdio: ['pipe', 'pipe', 'ignore'] })
        .toString();
      runningNames = output
        .split(/\r?\n/)
        .map(name => name && name.trim().toLowerCase())
        .filter(Boolean);
    } catch (e) {
      // If docker is not available or fails, keep runningNames empty
    }

    console.log('📦 Fabric Containers Status:\n');
    console.log('───────────────────────────────────────');
    
    for (const aliases of containerAliases) {
      const isRunning = aliases
        .map(n => n.toLowerCase())
        .some(name => runningNames.includes(name));
      const label = aliases[0];
      const status = isRunning ? '🟢 Running' : `🔴 Not Found`;
      console.log(`${status} - ${label}`);
      if (isRunning) containersRunning++;
    }

    console.log('───────────────────────────────────────\n');

    // Check wallet
    const walletPath = path.join(__dirname, '../wallet');
    const walletExists = fs.existsSync(walletPath);
    
    console.log('💼 Wallet Status:');
    console.log('───────────────────────────────────────');
    
    if (walletExists) {
      const files = fs.readdirSync(walletPath);
      console.log(`✅ Wallet exists at: ${walletPath}`);
      if (files.length > 0) {
        console.log(`📝 Identities found: ${files.join(', ')}`);
      } else {
        console.log('⚠️  Wallet is empty - run enrollment script');
      }
    } else {
      console.log('❌ Wallet does not exist - run enrollment script');
    }
    
    console.log('───────────────────────────────────────\n');

    // Check connection profile
    const connectionProfilePath = path.join(__dirname, '../network/connection-org1.json');
    const profileExists = fs.existsSync(connectionProfilePath);
    
    console.log('📋 Configuration Status:');
    console.log('───────────────────────────────────────');
    console.log(`${profileExists ? '✅' : '❌'} Connection Profile: ${profileExists ? 'Found' : 'Not Found'}`);
    
    // Point to root-level network/crypto-config (../../ from scripts directory)
    const cryptoConfigPath = path.join(__dirname, '../../network/crypto-config');
    const cryptoExists = fs.existsSync(cryptoConfigPath);
    console.log(`${cryptoExists ? '✅' : '❌'} Crypto Config: ${cryptoExists ? 'Found' : 'Not Found'}`);
    
    console.log('───────────────────────────────────────\n');

    // Summary
    console.log('📊 Summary:');
    console.log('───────────────────────────────────────');
    console.log(`Containers Running: ${containersRunning}/${containerAliases.length}`);
    
    if (containersRunning === containerAliases.length) {
      console.log('✅ All Fabric containers are running!');
    } else if (containersRunning > 0) {
      console.log('⚠️  Some containers are not running');
    } else {
      console.log('❌ No Fabric containers are running');
      console.log('💡 Run: cd network && docker-compose up -d');
    }
    
    if (!walletExists || fs.readdirSync(walletPath).length === 0) {
      console.log('💡 Run enrollment: node backend/scripts/enrollAdmin.js');
    }

  } catch (error) {
    console.error('❌ Error checking Fabric status:', error.message);
    console.log('\n💡 Make sure Docker is running');
  }
}

checkFabricStatus();

