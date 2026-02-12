#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const transform = require('../lib/transformer');

const projectRoot = process.cwd();

async function run() {
  console.log('🛡️  Vite-Shield: Securing your project...');

  // 1. Update vite.config
  const configPath = ['vite.config.ts', 'vite.config.js']
    .map(f => path.join(projectRoot, f))
    .find(p => fs.existsSync(p));

  if (configPath) {
    const content = fs.readFileSync(configPath, 'utf8');
    const updated = transform(content);
    fs.writeFileSync(configPath, updated);
    console.log('✅ Updated Vite Configuration.');
  }

  // 2. Create Production Server
  const serverPath = path.join(projectRoot, 'server.js');
  const serverTemplate = `
const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('🚀 Secure server: http://localhost:' + PORT));
  `;
  
  fs.writeFileSync(serverPath, serverTemplate);
  console.log('✅ Created production server.js.');

  // 3. Update package.json
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts['serve:prod'] = 'node server.js';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Added "serve:prod" script to package.json.');
}

run().catch(console.error);