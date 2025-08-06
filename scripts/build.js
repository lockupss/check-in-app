const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

try {
  // Step 1: Build Next.js application (skip Prisma generation during build)
  console.log('🏗️  Building Next.js application...');
  console.log('📝 Note: Prisma client will be generated at runtime when DATABASE_URL is available');
  
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');

  // Step 2: Verify build artifacts
  const nextDir = path.join(process.cwd(), '.next');
  const routesManifest = path.join(nextDir, 'routes-manifest.json');
  
  if (fs.existsSync(routesManifest)) {
    console.log('✅ routes-manifest.json found');
  } else {
    console.log('❌ routes-manifest.json not found');
    process.exit(1);
  }

  console.log('🎉 Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 