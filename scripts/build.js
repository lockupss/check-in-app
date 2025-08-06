const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

try {
  // Step 1: Try to generate Prisma client
  console.log('📦 Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.log('⚠️  Prisma generation failed, continuing with build...');
    console.log('This is expected if DATABASE_URL is not available during build');
  }

  // Step 2: Build Next.js application
  console.log('🏗️  Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');

  // Step 3: Verify build artifacts
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