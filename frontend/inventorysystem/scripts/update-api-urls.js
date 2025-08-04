#!/usr/bin/env node

/**
 * Script to update all hardcoded localhost:5000 URLs to production URLs
 * Usage: node scripts/update-api-urls.js <production-url>
 * Example: node scripts/update-api-urls.js https://api.yourdomain.com
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const productionUrl = process.argv[2];

if (!productionUrl) {
  console.error('❌ Please provide a production URL');
  console.log('Usage: node scripts/update-api-urls.js <production-url>');
  console.log('Example: node scripts/update-api-urls.js https://api.yourdomain.com');
  process.exit(1);
}

if (!productionUrl.startsWith('http')) {
  console.error('❌ Production URL must start with http:// or https://');
  process.exit(1);
}

console.log(`🔄 Updating all API URLs from localhost:5000 to ${productionUrl}`);

// Find all JavaScript and JSX files
const files = glob.sync('src/**/*.{js,jsx}', { cwd: process.cwd() });

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;
  
  // Replace localhost:5000 with production URL
  const newContent = content.replace(
    /http:\/\/localhost:5000/g,
    productionUrl
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    fileChanged = true;
    const changes = (content.match(/http:\/\/localhost:5000/g) || []).length;
    totalChanges += changes;
    console.log(`✅ Updated ${file} (${changes} changes)`);
  }
});

console.log(`\n🎉 Completed! Updated ${totalChanges} URLs across ${files.length} files`);
console.log(`📝 Don't forget to test your application after making these changes`);
console.log(`🔧 You may also want to create environment variables for the API URL in the future`); 