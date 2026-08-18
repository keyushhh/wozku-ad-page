import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const zipName = 'landing-page-dev-handoff.zip';
const zipPath = path.resolve(process.cwd(), zipName);

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('📦 Creating clean project ZIP for dev team (no git history, no AI metadata)...');

// Exclude git history, node_modules, build outputs, local cache, and AI configs
const excludes = [
  '*.git*',
  '*.claude*',
  '*.gemini*',
  '*node_modules*',
  '*dist*',
  '*.assetcache*',
  '*wozku-artifact.html*',
  '*wozku-preview.html*',
  '*.DS_Store*',
  '*.zip*'
];

const excludeFlags = excludes.map(pattern => `-x "${pattern}"`).join(' ');
const cmd = `zip -r "${zipName}" . ${excludeFlags}`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\n✅ Done! Clean ZIP created at: ${zipName}`);
  console.log('👉 You can safely share this file with your dev team. It contains zero Git history or repo URLs.');
} catch (error) {
  console.error('❌ Failed to create zip:', error.message);
  process.exit(1);
}
