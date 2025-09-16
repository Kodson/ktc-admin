#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up KTC Energy Management System...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  console.log('Please upgrade Node.js: https://nodejs.org/');
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create environment file if it doesn't exist
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# KTC Energy Management System Environment Variables
VITE_APP_TITLE="KTC Energy Management"
VITE_APP_VERSION="1.0.0"

# Add your environment variables here
# VITE_API_URL=http://localhost:3000/api
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created (.env.local)');
}

console.log('\n🎉 Setup complete! You can now run:');
console.log('\n   npm run dev     - Start development server');
console.log('   npm run build   - Build for production');
console.log('   npm run lint    - Run code linting');
console.log('\n📚 Demo credentials:');
console.log('   Station Manager: manager / password');
console.log('   Admin:          admin / password');
console.log('   Super Admin:    superadmin / password');
console.log('\n🔗 Development server will be available at: http://localhost:5173');
console.log('\n⛽ Welcome to KTC Energy Management System! 🇬🇭');