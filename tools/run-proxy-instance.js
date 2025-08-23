const { spawn } = require('child_process');
const FRONTEND_PORT = process.argv[2] || '5174';
const PROXY_PORT = process.argv[3] || '8081';
const env = Object.assign({}, process.env, { FRONTEND_PORT, PROXY_PORT });
const child = spawn(process.execPath, ['tools/local-proxy.js'], { env, stdio: 'inherit' });
child.on('close', code => console.log('proxy exited', code));
