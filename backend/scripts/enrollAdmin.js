const { FabricCAServices, Wallets } = require('fabric-network');
const FabricCAClient = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

async function enrollAdmin() {
  try {
    console.log('🔐 Starting admin enrollment...');
    
    // Create a new wallet for holding credentials
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`📁 Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the appUser
    const identity = await wallet.get('appUser');
    if (identity) {
      console.log('✅ An identity for the admin user "appUser" already exists in the wallet');
      console.log('ℹ️ Delete the wallet folder to recreate the identity');
      return;
    }

    // Check to see if we've already enrolled the admin
    const adminExists = await wallet.get('admin');
    if (adminExists) {
      console.log('✅ An identity for the admin user "admin" already exists in the wallet');
      return;
    }

    // Read CA certificate
    const caCertPath = path.resolve(
      __dirname, 
      '../network/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem'
    );
    
    if (!fs.existsSync(caCertPath)) {
      console.error('❌ CA certificate not found at:', caCertPath);
      console.log('💡 Please ensure the crypto-config folder is generated');
      return;
    }

    // Create a new CA client for interacting with the CA
    const caInfo = {
      caName: 'ca-org1',
      url: 'https://localhost:7054',
      tlsCACerts: {
        path: caCertPath
      }
    };
    
    console.log('📋 Creating CA client...');
    const ca = new FabricCAServices(caInfo);

    // Enroll the admin user
    console.log('🔐 Enrolling admin user...');
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw'
    });
    
    console.log('✅ Successfully enrolled admin user');
    console.log('🔑 Creating identity...');

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId: 'Org1MSP',
      type: 'X.509'
    };

    await wallet.put('admin', x509Identity);
    console.log('✅ Successfully enrolled admin user and imported into wallet');

    // Create appUser identity using admin identity
    console.log('👤 Registering appUser...');
    const adminUser = await wallet.get('admin');
    
    // Create new CA client for registration
    const caClient = new FabricCAClient('https://localhost:7054', {
      tlsCACerts: {
        path: caCertPath
      }
    }, 'ca-org1');

    // Register appUser
    const registerRequest = {
      enrollmentID: 'appUser',
      enrollmentSecret: 'appUserpw',
      affiliation: 'org1.department1',
      role: 'client',
      attrs: [{ name: 'role', value: 'appUser', ecert: true }]
    };

    const enrollmentSecret = await caClient.register(registerRequest, adminUser);
    console.log('✅ Successfully registered appUser');
    
    // Enroll appUser
    console.log('🔐 Enrolling appUser...');
    const appUserEnrollment = await caClient.enroll({
      enrollmentID: 'appUser',
      enrollmentSecret: 'appUserpw'
    });

    const appUserX509Identity = {
      credentials: {
        certificate: appUserEnrollment.certificate,
        privateKey: appUserEnrollment.key.toBytes()
      },
      mspId: 'Org1MSP',
      type: 'X.509'
    };

    await wallet.put('appUser', appUserX509Identity);
    console.log('✅ Successfully enrolled appUser and imported into wallet');
    console.log('🎉 Enrollment complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Deploy chaincode: cd network && ./scripts/deployChaincode.sh');
    console.log('   2. Check status: node backend/scripts/checkFabricStatus.js');

  } catch (error) {
    console.error(`❌ Failed to enroll admin: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure Fabric network is running: docker ps');
    console.log('   2. Check if CA is accessible: https://localhost:7054');
    process.exit(1);
  }
}

enrollAdmin();
