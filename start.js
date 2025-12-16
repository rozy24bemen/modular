import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'server', 'index-unified.js');

console.log('🚀 Starting Modular server...');
console.log('📁 Server path:', serverPath);

const child = spawn('node', [serverPath], {
  cwd: join(__dirname, 'server'),
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});
