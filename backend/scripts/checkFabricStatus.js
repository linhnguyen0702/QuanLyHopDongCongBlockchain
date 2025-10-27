const docker = require('docker-cli-js');
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');

async function checkFabricStatus() {
  console.log('🔍 Checking Hyperledger Fabric Status...\n');

  const requiredContainers = [
    'orderer.example.com',
    'peer0.org1.example.com',
    'ca_peerOrg1',
    'cli'
  ];

  const docker = new Docker();
  let containersRunning = 0;

  try {
    // Get all containers
    const containers = await docker.listContainers({ all: true });

    console.log('📦 Fabric Containers Status:\n');
    console.log('───────────────────────────────────────');
    
    for (const containerName of requiredContainers) {
      const container = containers.find(c => c.Names && c.Names.includes(`/${containerName}`));
      
      if (container) {
        const isRunning = container.State === 'running';
        const status = isRunning ? '🟢 Running' : '🔴 Stopped';
        console.log(`${status} - ${containerName}`);
        
        if (isRunning) {
          containersRunning++;
        }
      } else {
        console.log(`🔴 Not Found - ${containerName}`);
      }
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
    
    const cryptoConfigPath = path.join(__dirname, '../network/crypto-config');
    const cryptoExists = fs.existsSync(cryptoConfigPath);
    console.log(`${cryptoExists ? '✅' : '❌'} Crypto Config: ${cryptoExists ? 'Found' : 'Not Found'}`);
    
    console.log('───────────────────────────────────────\n');

    // Summary
    console.log('📊 Summary:');
    console.log('───────────────────────────────────────');
    console.log(`Containers Running: ${containersRunning}/${requiredContainers.length}`);
    
    if (containersRunning === requiredContainers.length) {
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

